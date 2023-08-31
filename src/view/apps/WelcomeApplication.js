import { SvelteApplication } from '#runtime/svelte/application';
import WelcomeAppShell from './WelcomeAppShell.svelte';


export default class WelcomeApplication extends SvelteApplication {
   /**
    * Default Application options
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/Application.html#options
    */
   static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
         title: 'ICON.Welcome',  // Automatically localized from `lang/en.json`.
         width: 400,

         svelte: {
            class: WelcomeAppShell,
            target: document.body,
            props: function() {
               return {
                  app: this // `this` is the SvelteApplication when invoked
               };
            }
         }
      });
   }
}