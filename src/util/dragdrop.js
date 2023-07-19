import { IconActor } from "../documents/actor";
import { IconItem } from "../documents/item";

// //////////// HERE BE DRAGON DROPS ////////////
// Very useful:
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#drop
// more raw api data:
// https://developer.mozilla.org/en-US/docs/Web/API/Document/drag_event

/**
 * @typedef {object} ResolvedItemDrop
 *
 * @property {"Item"} type Type is an Item
 *
 * @property {IconItem} document Resolved Document
 */

/**
 * @typedef {object} ResolvedActorDrop
 *
 * @property {"Actor"} type Type is an Actor
 *
 * @property {IconActor} document Resolved Document
 */

/**
 * @typedef {object} ResolvedMacroDrop
 *
 * @property {"Macro"} type Type is a macro
 *
 * @property {Macro} document Resolved Document
 */

/**
 * @typedef {ResolvedItemDrop | ResolvedActorDrop | ResolvedMacroDrop} ResolvedDrop
 * A union type of all the resolved drops we could have
 */

/**
 * @callback DropHandler A callback for handling document drops
 *
 * @param {ResolvedDrop} doc The dropped document
 *
 * @param {HTMLEvent} dest Where it was dropped
 *
 * @param {DropEvent} event Event for where it being dropped
 */

/**
 * @callback DropPredicate A callback for determining whether document drop is allowed
 *
 * @param {ResolvedDrop} doc The potentially dropped document
 *
 * @param {HTMLElement} dest Where it would be dropped
 *
 * @param {DropEvent | DragOverEvent | DragEnterEvent | DragLeaveEvent} event Event for it hovering ominously / perhaps being dropped
 */

/**
 * @callback HoverHandler A callback for doing temporary ui changes when hovering over a valid drop target.
 *                        Somewhat unreliably triggered in nested situations!
 *
 * @param {ResolvedDrop} doc The potentially dropped document
 *
 * @param {HTMLElement} dest Where it would be dropped
 *
 * @param {DropEvent | DragOverEvent | DragEnterEvent | DragLeaveEvent} event Event for it hovering ominously / perhaps being dropped
 */

/**
 * Svelte action to enable dropability on the specified node, 
 * using the global drag state as a lookup to allow synchronous doc handling.
 * 
 * Designed more as a basis for other actions
 *
 * @param {HTMLElement} node - Target element
 *
 * @param {DropHandler} drop_handler - Callback provided with the data for the drag, the dest of the drag, as well as the dragover event.
 *      It is called once, and only on a successful drop
 *      Note that it is guaranteed to have passed the allow_drop function if one was provided
 *      Not all of these arguments are usually necessary: remember you can just _ away unused vars
 *
 * @param {DropPredicate} [allow_drop=null] Optional callback provided with the dest of the drag, as well as the dragover event.
 *      It determines if the dest is a valid drop target
 * 
 * @param {DropPredicate} [hover_handler=null] Optional callback provided with the dest of the drag, as well as the dragover event.
 *      It determines if the dest is a valid drop target
 */
export function baseDropDocumentAction(node, { drop_handler, allow_drop = null, hover_handler = null }) {
    // Bind these individually, so we don't have to rely so much on the drop target being preserved
    // To permit dropping, we must override the base dragover behavior.
    function onDragOver(event) {
        // Get/check data
        if (!GlobalDragPreview) {
            return true;
        } // Blanket allow drops if we don't know whats dragging

        // Check if we can drop. If no handler, this is always true (so long as GlobalDragPreview exists)
        let drop_permitted = !allow_drop || allow_drop(GlobalDragPreview, this, event);

        // If permitted, override behavior to allow drops
        if (drop_permitted) {
            event.preventDefault();
            return false;
        }
    }

    // We also must signal this via the dragenter event, which serves double duity
    let entered = true;
    function onDragEnter(event) {
        // Check if we can drop
        if (!GlobalDragPreview) {
            return true;
        } // Blanket allow drops if we don't know whats dragging
        let drop_permitted = !allow_drop || allow_drop(GlobalDragPreview, node, event);

        if (drop_permitted) {
            if (hover_handler) hover_handler(GlobalDragPreview, node, true);
            // Override behavior to allow dropping here
            event.preventDefault();
            entered = true;
            return false;
        }

        return true; // Prevents dropping
    }

    // We also must signal this via the dragenter event, which serves double duity
    function onDragLeave(event) {
        if (entered) {
            if (hover_handler) hover_handler(GlobalDragPreview, node, false);
            entered = false;
        }
    }

    // Finally and most importantly, dropping
    function onDrop(event) {
        if (entered) {
            if (hover_handler) hover_handler(GlobalDragPreview, node, false);
        }

        // Check dropability just to be safe - some event may have trickled down here somehow
        if (!event.originalEvent?.dataTransfer?.getData("text/plain")) {
            return;
        }

        if (GlobalDragPreview) {
            // We can proceed synchronously
            let rdd = GlobalDragPreview;
            if (!allow_drop || allow_drop(rdd, item, event)) {
                // It's a good drop - prevent propagation and handle
                event.stopImmediatePropagation();
                event.preventDefault();
                drop_handler(rdd, item, event);
            }
        } else {
            // Unfortunately, if global drag preview isn't set then it is necessary for us to aggressively cancel events to prevent possible duplicate drop handling
            event.stopImmediatePropagation();
            event.preventDefault();
            resolveNativeDrop(event.originalEvent.dataTransfer.getData("text/plain")).then((rdd) => {
                if (rdd && (!allow_drop || allow_drop(rdd, item, event))) {
                    drop_handler(rdd, item, event);
                }
            });
        }
    }

    /**
     * Activate listeners.
     */
    function activateListeners() {
        node.addEventListener('onDragOver', onDragOver);
        node.addEventListener('onDragEnter', onDragEnter);
        node.addEventListener('onDragLeave', onDragLeave);
        node.addEventListener('onDrop', onDrop);
    }

    /**
     * Remove listeners.
     */
    function removeListeners() {
        node.removeEventListener('onDragOver', onDragOver);
        node.removeEventListener('onDragEnter', onDragEnter);
        node.removeEventListener('onDragLeave', onDragLeave);
        node.removeEventListener('onDrop', onDrop);
    }

    activateListeners();

    return {
        // Currently not implemented, but this is where you'd update the options for this action.
        // IE changing the TJSDocument or path field.
        update: console.warn,

        destroy: () => {
            removeListeners();
            unsubscribe();
        }
    };
}


/**
 * @typedef {object} FoundryDropData Dragged data as generated by foundry
 *
 * @property {"Actor" | "Item" | "JournalEntry" | "Macro" | "Scene"} type The type of dragged object
 *
 * @property {string} uuid The dragged document's uuid
 */

/** 
 * Safely parse a JSON string, returning null on failure instead of throwing an exception
 *
 * @param {string} str The string to parse
 *
 * @returns {any} Parsed json or null
 */
export function safeParseJSON(str) {
    try {
        let result = JSON.parse(str);
        return result;
    } catch {
        return null;
    }
}

// Resolves a native foundry actor/item drop event datatransfer to the actual contained actor/item/journal
// This can be annoying, so we made it a dedicated method
// Input is either a stringified JSON dropData or a uuid

/**
 * Converts a foundry drop into our resolved drop
 * 
 * @param {string | FoundryDropData} drop The raw drop data, either as string uuid, a Foundry Drop, or JSON of a Foundry drop
 *
 * @returns {Promise<ResolvedDrop | null>} Promise yielding the resolved drop data, or null on failure
 */
export async function resolveNativeDrop(drop) {
    // Get dropped data
    let parsed_drop = drop;
    if (typeof drop == "string") {
        parsed_drop = safeParseJSON(drop);
    }
    if (!parsed_drop && typeof drop == "string") {
        // Either wasn't an object, or failed to parse to be one from a stringAttempt uuid route
        let document = await fromUuid(drop);
        if (!document) {
            return null;
        }
        if (document instanceof Actor) {
            return {
                type: "Actor",
                document,
            };
        } else if (document instanceof Item) {
            return {
                type: "Item",
                document,
            };
        } else if (document instanceof Macro) {
            return {
                type: "Macro",
                document,
            };
        } else if (document instanceof JournalEntry) {
            return {
                type: "JournalEntry",
                document,
            };
        }
    } else if (typeof drop == "object") {
        // We presume it to be a normal dropData.
        drop = parsed_drop;
        if (drop.type == "Actor") {
            let document = await Actor.fromUuid(drop.uuid);
            return document ?
                {
                    type: "Actor",
                    document,
                } :
                null;
        } else if (drop.type == "Item") {
            let document = await Item.fromUuid(drop.uuid);
            return document ?
                {
                    type: "Item",
                    document,
                } :
                null;
        } else if (drop.type == "JournalEntry") {
            // @ts-ignore
            let document = await JournalEntry.fromDropData(drop);
            return document ?
                {
                    type: "JournalEntry",
                    document,
                } :
                null;
        } else if (drop.type == "Macro") {
            // @ts-ignore
            let document = await Macro.fromDropData(drop);
            return document ?
                {
                    type: "Macro",
                    document,
                } :
                null;
        }
    }
    return null;
}

// A basic cache suitable for native drop lookups - a common task
// export type DragFetcherCache = FetcherCache<string | FoundryDropData, ResolvedDropData | null>;
// export function dragResolverCache(): DragFetcherCache {
// return new FetcherCache(resolve_native_drop);
// }

// GlobalDragState 
/** 
 * Provides a resolved document of whatever is being dragged, if a document can be resolved
 *
 * @type {ResolvedDrop | null} 
 */
export let GlobalDragPreview = null;

/**
 * Generates a CSS class for the given document type, 
 * to be affixed to the document body
 *
 * @param {string} for_type The document subtype that is being dragged
 *
 * @returns {string} An appropriately named css class
 */
function draggingClass(for_type) {
    return `dragging-${for_type}`;
}

/**
 * Sets the GlobalDragPreview constant, and manages global classes appropriately for it
 *
 * @param {IconActor | IconItem | null} to What we are currently dragging, if anything
 */
function setGlobalDrag(to) {
    // Clear if necessary
    if (GlobalDragPreview?.type == "Actor" || GlobalDragPreview?.type == "Item") {
        $("body").removeClass(draggingClass(GlobalDragPreview.document.type));
    }

    // Store the draggee
    if (to instanceof Actor) {
        GlobalDragPreview = {
            document: to,
            type: "Actor",
        };
    } else if (to instanceof Item) {
        GlobalDragPreview = {
            document: to,
            type: "Item",
        };
    } else if (to instanceof Macro) {
        GlobalDragPreview = {
            document: to,
            type: "Macro",
        };
    } else if (to instanceof Scene) {
        GlobalDragPreview = {
            document: to,
            type: "Scene",
        };
    } else if (to == null) {
        GlobalDragPreview = null;
        return;
    }

    // Add an appropriate class
    if (GlobalDragPreview?.type == "Actor" || GlobalDragPreview?.type == "Item") {
        $("body").addClass(draggingClass(GlobalDragPreview.document.type));
    }
}

// Setup global drag resolution
/**
 *
 */
export function applyGlobalDragListeners() {
    let body = document.getElementsByTagName("body")[0];
    let cancel_token = { canceled: false };

    // Capture when we start dragging anything anywhere - this covers regrefs and native drags
    body.addEventListener(
        "dragstart",
        (evt) => {
            // Attempt to recover the item
            let target = evt.target;
            let uuid = "";
            if (target?.dataset?.uuid) {
                // Is our set uuid
                uuid = target.dataset.uuid;
            } else if (target?.dataset?.documentId) {
                // Is a foundry sidebar or compendium drag
                let sbt = $(target).parents(".sidebar-tab")[0];
                if (sbt?.dataset?.tab) {
                    // Can deduce type based on the tab
                    let tab = sbt.dataset.tab;
                    uuid = `${tab.charAt(0).capitalize()}${tab.slice(1, tab.length - 1)}.${target.dataset.documentId}`;
                } else {
                    let cd = $(target).parents(".compendium.directory")[0];
                    if (cd) {
                        // Can deduce pack based on the directory
                        let pack = cd.dataset.pack;
                        uuid = `Compendium.${pack}.${target.dataset.documentId}`;
                    }
                }
            } else {
                return; // Not a uuid
            }

            // TODO: handle journals, macros, scenes

            // May or may not have a uuid by now
            // If we do, tell it to try setting global drag
            let cancel_token_copy = cancel_token;
            fromUuid(uuid).then((doc) => {
                if (!cancel_token_copy.canceled) {
                    setGlobalDrag(doc);
                }
            });
        },
        {
            capture: true, // We don't want people preventing us from seeing this!
            passive: true, // Improves performance. We only want to watch
        }
    );

    // Clear whenever we stop dragging anywhere. Have to handle both drag end and drop.
    const endListener = () => {
        setGlobalDrag(null);
        cancel_token.canceled = true;
        cancel_token = { canceled: false };
    };
    body.addEventListener("dragend", endListener, {
        capture: true, // Same as above
        passive: true,
    });
    body.addEventListener("drop", endListener, {
        capture: true, // Same as above
        passive: true,
    });
}
