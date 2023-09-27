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
    * @param {Actor} attacker - The person making the attack
    *
    * @param {import('#svelte-fvtt/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    */
   constructor(attacker, dialogData = {}) {
      if (attacker && !(attacker instanceof Actor)) {
         console.warn(`DamageRollPromptApplication - invalid attacker, must be an actor`);
         return null;
      }

      super({
         modal: true,
         draggable: false,
         focusFirst: true,
         focusKeep: true,
         minimizable: false,
         ...dialogData,
         content: {
            class: DamageRollPromptShell,
            props: {
               attacker: new TJSDocument(attacker ?? undefined),
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
      }, { width: 400 });
   }

   /**
    * Prompts the user for data. Handles instantiation, rendering, and follow through
    * 
    * @param {Actor} data_type - Field type
    * 
    * @param {import('#svelte-fvtt/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    * 
    * @param dialog_data
    *
    * @returns {Promise<string | number | null>} The value, or null if the user cancelled the prompt
    */
   static async show(attacker, dialog_data = {}) {
      return new DamageRollPromptApplication(attacker, dialog_data).wait();
   }
}
