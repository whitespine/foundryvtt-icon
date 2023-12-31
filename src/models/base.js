import { formatDotpath } from "../util/paths";

// Establish a shorthand
export const fields = foundry.data.fields;

export class IconDataModel extends foundry.abstract.DataModel {
  // To enable cool shit

  /**
   * Create a full update payload, e.g. to preserve arrays
   *
   * @param {object} update_data the update data to apply
   *
   * @returns {object} update_data augmented with fixed arrays etc
   */
  fullUpdateData(update_data) {
    const system = foundry.utils.duplicate(this._source);
    return fancyMerge({ system }, update_data);
  }
}

/**
 * Merge data, except it handles arrays in a more sane way than base mergeObject
 *
 * @param {object} target Object to modify 
 *
 * @param {object} source Object to pull from
 *
 * @returns {object} target
 */
export function fancyMerge(target, source) {
  if (target === null || target === undefined) {
    throw new Error("Cannot merge with null or undefined - try again");
  }
  if (
    typeof target === "number" ||
    typeof target === "string" ||
    typeof target === "boolean"
  ) {
    return source; // Handle in parent
  }
  for (let [k, v] of Object.entries(source)) {
    // Prepare for dotpath traversal
    k = formatDotpath(k);

    // Detect deletes
    const del = k.startsWith("-=");
    if (del) {
      k = k.slice(2);
    }

    // Detect dots
    const di = k.indexOf(".");
    if (di != -1) {
      if (del) {
        throw new Error("'-=' in dotpath must go at penultimate pathlet. E.x. 'system.whatever.-=val'");
      }

      // Dotpath - go recursive on that key
      const fore = k.slice(0, di);
      const aft = k.slice(di + 1);

      // Find existing value and branch on its existence
      const prior = target[fore];
      if (prior) {
        // Recursive
        target[fore] = fancyMerge(prior, { [aft]: v });
      } else {
        // New value at this location
        target[fore] = { [aft]: v };
      }
    } else {
      // Not a dotpath - assign/delete directly. Fairly trivial
      if (del) {
        if (Array.isArray(target)) {
          // Splice it
          target.splice(parseInt(k), 1);
        } else if (typeof target === "object") {
          // Delete it
          delete target[k];
        } else {
          // Unhandled type or nonexistant val
          console.warn("'-=' in update may only target Object or Array items");
        }
      } else {
        // Just assign it - simple as
        target[k] = v;
      }
    }
  }
  return target;
}

// Use this to represent a field that is effectively just a number, but should present as a min/max/value field in expanded `system` data
// This is 10% so we can show them with bars, and 90% because usually the max is computed and we don't want to confuse anyone
// If options.no_upper_bound is true, then doesn't set a maximum 
export class FakeBoundedNumberField extends foundry.data.fields.NumberField {
  constructor(options = {}) {
    // Handle no upper bound case
    if (options.no_upper_bound) {
      options = foundry.utils.duplicate(options);
      options.fake_max = options.max;
      delete options.max;
    }
    super(options);
  }
  /** @override */
  initialize(value, model) {
    // Expand to a somewhat reasonable range. `prepareData` functions should handle the rest
    return {
      min: this.options.min ?? 0,
      max: this.options.max ?? this.options.fake_max ?? 0,
      value: value ?? 0,
    };
  }

  /** @override */
  _cast(value) {
    if (typeof value === "object") {
      value = value.value ?? 0;
    }
    return super._cast(value);
  }
}

/**
 * For representing clocks
 * Takes an option "size" that, if provided, will fix the size of the clock to that size. Otherwise size is arbitrary
 */
export class ClockField extends foundry.data.fields.SchemaField {
  constructor(options = {}) {
    const initial_size = options.size ?? 4;
    super({
      active: new fields.BooleanField({ initial: false }),
      name: new fields.StringField({ initial: `New ${initial_size} Clock` }),
      size: new fields.NumberField({ nullable: false, integer: true, min: 0, initial: initial_size }),
      value: new fields.NumberField({ nullable: false, integer: true, min: 0, initial: 0 }),
    }, options);
  }

  /** @override */
  _cast(value) {
    if (typeof value == "number") {
      value = { value };
    }
    value = super._cast(value);
    if (this.options.size) {
      value.size = this.options.size;
    }
    return value;
  }

  /** @override */
  _validateModel(data, options = {}) {
    super._validateType(data, options);
    if (data.size < data.value) {
      throw new Error("Clock value has exceeded its size.");
    }
  }
}

/**
 * A field mixin generator that "fixes" attributes of another SchemaField
 * For representing fixed clocks, like xp.
 *
 * @param {any} preset The keys to override in any initialized data
 *
 * @returns {object} A mixin
 */
export function FixedFieldMixin(preset) {
  return {
    _initialze(value, model) {
      super._initialize(fancyMerge(value, preset), model);
    }
  };
}

export class ChecklistField extends fields.SchemaField {
  /** 
   * @override
   * @param {Array<string>} keys An Enum or Object, the Object.values of which will be used for 
   */
  constructor(keys, options = {}) {
    const scaffold = {};
    for (const val of keys) {
      scaffold[val] = new fields.BooleanField({ initial: true });
    }
    super(scaffold, options);
  }
}

/**  
 * Handles an additional "length" option, and mandates that it remain at that length
 * If "overflow" option = truthy, then just forces there to be AT LEAST length
 */
export class ControlledLengthArrayField extends fields.ArrayField {
  // Constructor demands options
  constructor(element, options) {
    super(element, options);
    if (!Number.isInteger(options.length)) {
throw new TypeError("ControlledLengthArrayField requires an integer 'length' option!");
}
  }

  _cast(value) {
    value = super._cast(value);
    if (!Array.isArray(value)) {
return value;
} // Give up early
    // Extend or contract as appropriate
    while (value.length < this.options.length) {
      let new_elt = typeof this.element.initial == "function" ? this.element.initial() : this.element.initial;
      value.push(foundry.utils.duplicate(new_elt));
    }
    if (!this.options.overflow && value.length > this.options.length) {
value = value.slice(0, this.options.length);
}
    return value;
  }
}

/**
 * Calls options.cast on every value provided to this. 
 * Options.cast should be idempotent.
 */
export class CastingStringField extends fields.StringField {
  _cast(value) {
    value = super._cast(value);
    if (typeof this.options.cast === "function") {
      value = this.options.cast(value);
    }
    return value;
  }
}

/**
 * Capitalizes the first letter of each word in the provided string
 * 
 * @param {string} text Base text
 *
 * @returns text as title case
 */
export function titleCaseString(text) {
  return text
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}