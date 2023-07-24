import { SvelteApplication } from '#runtime/svelte/application';

import FitdRollShell from './FitdRollShell.svelte';

let singleton = null;
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
         popOut: false,
         positionOrtho: false,
         zIndex: null,
      });
   }

   static async show({ x, y, initial_dice, initial_purpose } = {}) {
      if (!singleton?.svelte.applicationShell) {
         singleton = new ForgedRollApplication({
            svelte: {
               props: {
                  dice: initial_dice ?? 1,
                  purpose: initial_purpose ?? ""
               }
            }
         });
      } else {
         singleton.svelte.applicationShell.dice = initial_dice ?? 1;
         singleton.svelte.applicationShell.purpose = initial_purpose ?? "";
      }

      singleton.position.set({
         top: y,
         left: x
      });
      return singleton.render(true, { focus: true });
   }
}