import { SvelteApplication } from '#runtime/svelte/application';

import FitdRollShell from './FitdRollShell.svelte';

let singletonId = null;
export default class ForgedRollApplication extends SvelteApplication {
   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/classes/client.Application.html#options
    */
   static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
         id: "narrative_roll",
         title: 'ICON.Rolls.Narrative.Title',  // Automatically localized from `lang/en.json`.
         width: 400,
         height: "auto",

         svelte: {
            class: FitdRollShell,
            target: document.body,
            intro: true,
         },

         classes: ["icon", "app", "fitd-roll"],
         resizable: false,
         minimizable: false,
         positionOrtho: false,
         zIndex: null,
      });
   }

   static async show({ x, y, initial_dice, initial_purpose } = {}) {
      let app;
      if (singletonId && ui.windows[singletonId]) {
         app = ui.windows[singletonId];
         app.svelte.applicationShell.dice = initial_dice ?? 1;
         app.svelte.applicationShell.purpose = initial_purpose ?? "";
      } else {
         app = new ForgedRollApplication({
            svelte: {
               props: {
                  dice: initial_dice ?? 1,
                  purpose: initial_purpose ?? ""
               }
            }
         });
      } 

      app.position.set({
         top: y,
         left: x
      });
      await app.render(true, { focus: true });
      singletonId = app.appId;
   }
}