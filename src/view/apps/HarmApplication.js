
import { SvelteApplication } from '#runtime/svelte/application';

import HarmShell from './HarmShell.svelte';

export default class HarmApplication extends SvelteApplication {
   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/Application.html#options
    */
   static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
         title: 'ICON.Harm.Title',
         width: 64 * 8,
         height: 128+30,
         classes: ["icon"],

         svelte: {
            class: HarmShell,
            target: document.body
         }
      });
   }
}