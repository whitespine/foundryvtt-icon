import { SvelteApplication } from "#runtime/svelte/application";
import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
import DocSheetAppShell from "./DocSheetAppShell.svelte";

export default class TJSDocSheet extends SvelteApplication {
  /**
   * 
   * @param {IconActor | IconItem} doc Document to display
   *
   * @param {object} options Application options
   */
  constructor(doc, options = {}) {
    super({
      id: `doc_${doc.uuid.replaceAll(".", "_")}`,
      title: doc.name + (doc.isToken ? " [TOKEN]" : ""),
      svelte: {
        props: {
          tjs_doc: new TJSDocument(doc),
        },
      },
    });
    this.doc = doc;
  }

  _getHeaderButtons() {
    let buttons = [...super._getHeaderButtons()];
    if (this.doc instanceof Actor) {
      // Ripped from foundy
      const canConfigure = game.user.isGM || (this.actor.isOwner && game.user.can("TOKEN_CONFIGURE"));
      if (canConfigure) {
        const closeIndex = buttons.findIndex((btn) => btn.label === "Close");
        buttons.splice(closeIndex, 0, {
          label: this.doc.token ? "Token" : "TOKEN.TitlePrototype",
          class: "configure-token",
          icon: "fas fa-user-circle",
          onclick: (ev) => this._onConfigureToken(ev)
        });
      }
    }
    return buttons;
  }

  // Ripped straight from foundry
  _onConfigureToken(event) {
    event.preventDefault();
    const renderOptions = {
      left: Math.max(this.position.left - 560 - 10, 10),
      top: this.position.top
    };
    if (this.token) {
return this.token.sheet.render(true, renderOptions);
} else {
new CONFIG.Token.prototypeSheetClass(this.doc.prototypeToken, renderOptions).render(true);
}
  }

  /**
   * Default Application options
   */
  static ticker = 0;
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      // TODO: How to get normal Foundry buttons in the window header?
      classes: ["icon", "sheet", "actor"],
      resizable: true,
      minimizable: true,
      // popOut: false,
      width: 800,
      height: 800,
      positionOrtho: false,
      title: "Document Sheet",
      zIndex: null,
      svelte: {
        class: DocSheetAppShell,
        target: document.body,
        intro: true,
        props: {},
      },
    });
  }
}
