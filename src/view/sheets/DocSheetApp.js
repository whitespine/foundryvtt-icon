import { SvelteApplication } from "#runtime/svelte/application";
import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
import ActorSheetAppShell from "./DocSheetAppShell.svelte";

export default class TJSDocSheet extends SvelteApplication {
  /**
   * 
   * @param {IconActor | IconItem} doc Document to display
   *
   * @param {object} options Application options
   */
  constructor(doc, options = {}) {
    super({
      svelte: {
        props: {
          tjs_doc: new TJSDocument(doc),
        },
      },
    });
  }

  /**
   * Default Application options
   */
  static ticker = 0;
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      // TODO: How to get normal Foundry buttons in the window header?
      id: `actor-sheet-${this.ticker++}`,
      classes: ["icon", "sheet", "actor"],
      resizable: true,
      minimizable: true,
      popOut: false,
      width: 800,
      height: "auto",
      positionOrtho: false,
      transformOrigin: null,
      title: "Document Sheet",
      zIndex: null,
      svelte: {
        class: ActorSheetAppShell,
        target: document.body,
        intro: true,
        props: {},
      },
    });
  }
}
