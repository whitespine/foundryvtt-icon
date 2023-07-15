import { SvelteApplication } from "#runtime/svelte/application";
import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
import ActorSheetAppShell from "./ActorSheetAppShell.svelte";

export default class TJSActorSheet extends SvelteApplication {
  /**
   * 
   * @param {IconActor} actor Actor to display
   * @param {object} options Application options
   */
  constructor(actor, options = {}) {
    super({
      svelte: {
        props: {
          tjs_actor: new TJSDocument(actor),
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
      // TODO: why don't we get the normal Foundry buttons in the window header?
      // TODO: need a unique id per actor, otherwise Svelte won't let us open more than one at once
      id: `actor-sheet-${this.ticker++}`,
      classes: ["icon", "sheet", "actor"],
      resizable: false,
      minimizable: true,
      popOut: false,
      width: 800,
      height: "auto",
      positionOrtho: false,
      transformOrigin: null,
      title: "NEW ACTOR SHEET",
      zIndex: 95,
      svelte: {
        class: ActorSheetAppShell,
        target: document.body,
        intro: true,
        props: {},
      },
    });
  }
}
