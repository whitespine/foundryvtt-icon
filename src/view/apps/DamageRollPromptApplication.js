import { TJSDialog } from "#runtime/svelte/application";
import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
import DamageRollPromptShell from "./DamageRollPromptShell.svelte";

/**
 * Provides a dialog for creating documents that by default is modal and not draggable.
 */
export class DamageRollPromptApplication extends TJSDialog {
   /**
    * Prompts the user for data
    *
    * @param {import('#svelte-fvtt/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    */
   constructor(dialogData = {}) {
      super({
         modal: false,
         draggable: true,
         focusFirst: true,
         focusKeep: true,
         minimizable: false,
         ...dialogData,
         content: {
            class: DamageRollPromptShell,
            props: {
            }
         },
         title: dialogData.title ?? "Damage Roll",
         buttons: {
            confirm: {
               autoClose: true,
               icon: 'fas fa-dice-d20',
               label: "Roll",
               onPress: 'requestSubmit'
            },
            cancel: {
               autoClose: true,
               icon: 'fas fa-times',
               label: "Cancel",
               onPress: 'requestCancel'
            }
         },
         default: 'confirm'
      }, { 
         width: 400,
         classes: ["icon-dialog"],
      });
   }

   /**
    * Prompts the user for data. Handles instantiation, rendering, and follow through
    * 
    * @param {import('#svelte-fvtt/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    * 
    * @param dialog_data
    *
    * @returns {Promise<object | number | string | null>} The value, or null if the user cancelled the prompt
    */
   static async show(dialog_data = {}) {
      return new DamageRollPromptApplication(dialog_data).wait();
   }
}
