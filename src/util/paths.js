
/**
 * Helper function to format a dotpath to not have any square brackets, instead using pure dot notation
 *
 * @param {string} path The path to format
 *
 * @returns {string} The same path, but with all square brackets replaced with dots
 */
export function formatDotpath(path) {
  return path.replace(/\[/g, ".").replace(/]/g, "");
}

/**
 * An object providing context on the path and result relative to the most deploy nested document we encounter
 *
 * @typedef {object} PathResolutionStep 
 *
 * @property {string | null} pathlet The individual x, y, or z substrings of an x.y.z path
 *
 * @property {any} val The value reached at a specific x, y, or z of an x.y.z path
 */

/**
 * 
 * Helper function to get arbitrarily deep array references
 * Returns every item along the path, starting with the object itself
 * Any failed pathlet resolutions will still be emitted, but as an undefined
 * An empty string resolved in this way will simply return root.
 * 
 * @param {object} obj The object to drill down into
 *
 * @param {string} path The dotpath to use
 *
 * @returns {Array<PathResolutionStep>} An array of the steps we took resolving the path
 */
export function stepwiseResolveDotpath(obj, path) {
  const pathlets = formatDotpath(path).split(".");

  // Resolve each key, starting with root
  const result = [
    {
      pathlet: null, 
      val: obj
    },
  ];

  for (const pathlet of pathlets) {
    obj = obj?.[pathlet];
    result.push({
      pathlet,
      val: obj,
    });
  }
  return result;
}

/**
 * An object providing context on the path and result relative to the most deploy nested document we encounter
 *
 * @typedef {object} DrilldownDocumentResult 
 *
 * @property {IconActor | IconItem} sub_doc The last document traversed while following path from root_doc. Usually just root_doc
 *
 * @property {string} sub_path Path from sub_doc to terminus
 *
 * @property {any} terminus The actual value pointed to by the initial path query
 */

/**
 * A variant of resolve_dotpath that provides more context about documents we encounter along the way.
 *
 * @param {IconActor | IconItem} root_doc The document we are starting at
 *
 * @param {string} path The path to resolve
 *
 * @returns {DrilldownDocumentResult} Result
 */
export function drilldownDocument(root_doc, path) {
  const steps = stepwiseResolveDotpath(root_doc, path);
  for (let i = steps.length - 1; i >= 0; i--) {
    // Walk it back till first document
    const step = steps[i];
    if (step.val instanceof foundry.abstract.Document) {
      // Recombine rest of path
      const sub_path = steps
        .slice(i + 1)
        .map((v) => v.pathlet)
        .join(".");
      const sub_doc = step.val;
      return { sub_doc, sub_path, terminus: steps[steps.length - 1].val };
    }
  }
  throw new Error("Drilldown document must have at least one document in its path");
}

/**
 * @typedef {object} ResolveDotpathOptions
 *
 * @property {number} [shorten_by] If provided, skip the last <shorten_by> path items. Useful for getting e.x. the containing array of an item
 */

/**
 * Helper function to get arbitrarily deep array references
 * Any failed resolutions will still be emitted, but as a dedicated symbol
 *
 * @param {object} obj The object to drill down into
 *
 * @param {string} path The dotpath to follow
 *
 * @param {any} [default_=undefined] The default value to return if the dotpath is not reached.
 *
 * @param {ResolveDotpathOptions} [opts] Additional arguments
 *
 * @returns {any} Value at end of path, or default value
 */
export function resolveDotpath(obj, path, default_ = undefined, opts = null) {
  const evaluated = stepwiseResolveDotpath(obj, path);
  let item;

  // Get the last item, or one even further back if shorten-by provided
  if (opts?.shorten_by) {
    item = evaluated[evaluated.length - 1 - opts.shorten_by];
  } else {
    item = evaluated[evaluated.length - 1];
  }
  return item.val === undefined ? default_ : item.val;
}