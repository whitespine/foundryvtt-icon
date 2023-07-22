import { GlobalDragPreview, resolveNativeDrop } from '../../util/dragdrop';
import { easyActionBuilder } from './util';

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
 * @param {DropHandler} options.handle - Callback provided with the data for the drag, the dest of the drag, as well as the dragover event.
 *                                       It is called once, and only on a successful drop
 *                                       Note that it is guaranteed to have passed the drop function if one was provided
 *
 * @param {DropPredicate} [options.allow=null] Optional callback provided with the dest of the drag, as well as the dragover event.
 *      It determines if the dest is a valid drop target
 * 
 * @param {DropPredicate} [options.hover_handler=null] Optional callback provided with the dest of the drag, as well as the dragover event.
 *      It determines if the dest is a valid drop target
 */
export const dropDocs = easyActionBuilder({
    "dragover": (options, event) => {
        // Must return false & prevent default to allow dropping
        // Get/check data
        if (!GlobalDragPreview) {
            return true;
        } // Blanket allow drops if we don't know whats dragging

        // If permitted, override behavior to allow drops
        if (options.allow_drop?.(GlobalDragPreview, this, event) ?? true) {
            event.preventDefault();
            return false;
        }
    },
    "dragenter": (options, event) => {
        // Must return false & prevent default to allow dropping
        if (!GlobalDragPreview) {
            // Blanket allow drops if we don't know whats dragging
            return true;
        } 
        
        // Check if we can drop. If no handler, this is always true (so long as GlobalDragPreview exists)
        if(options.allow?.(GlobalDragPreview, event) ?? true) {
            // curr_options.hover_handler?.(GlobalDragPreview, node, true);
            // Override behavior to allow dropping here
            event.preventDefault();
            return false;
        }

        return true; // Prevents dropping
    },
    "drop": (options, event) => {
        // Check dropability just to be safe - some event may have trickled down here somehow
        if (!event.dataTransfer?.getData("text/plain")) {
            return;
        }

        if (GlobalDragPreview) {
            // We can proceed synchronously
            if (options.allow?.(GlobalDragPreview, event) ?? true) {
                // It's a good drop - prevent propagation and handle
                event.stopImmediatePropagation();
                event.preventDefault();
                options.handle?.(GlobalDragPreview, event);
            }
        } else {
            // Unfortunately, if global drag preview isn't set then it is necessary for us to aggressively cancel events to prevent possible duplicate drop handling
            event.stopImmediatePropagation();
            event.preventDefault();
            resolveNativeDrop(event.originalEvent.dataTransfer.getData("text/plain")).then((rdd) => {
                if (rdd && (options.allow?.(rdd, event) ?? true)) {
                    options.handle?.(rdd, event);
                }
            });
        }
    },
})

