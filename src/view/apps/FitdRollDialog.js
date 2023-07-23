import { SvelteApplication }  from '#runtime/svelte/application';

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
         title: 'ICON.Rolls.Narrative.Title',  // Automatically localized from `lang/en.json`.
         width: 400,
         height: 300,

         svelte: {
            class: FitdRollShell,
            target: document.body
         }
      });
   }

   static show({x, y} = {}) {
      if(!singleton) {
         singleton = new ForgedRollApplication();
      }  
      singleton.position.set({
         top: y,
         left: x
      });
      singleton.render(true, {focus: true});
   }
}