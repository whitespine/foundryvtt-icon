import { TJSDialog } from "#runtime/svelte/application";
import RapidPromptShell from "./RapidPromptShell.svelte";

/**
 * Provides a dialog for creating documents that by default is modal and not draggable.
 */
export class RapidPromptApplication extends TJSDialog {
   /**
    * Prompts the user for data
    *
    * @param {"number" | "text"} data_type - Field type
    *
    * @param {import('#svelte-fvtt/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    */
   constructor(data_type, dialogData = {}) {
      if (["text" | "number"].includes(data_type)) {
         console.warn(`RapidPromptApplication - invalid type ${data_type}`);
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
            class: RapidPromptShell,
            props: {
               data_type,
            }
         },
         title: dialogData.title ?? "Prompt",
         buttons: {
            confirm: {
               autoClose: true,
               icon: 'fas fa-check',
               label: "Confirm",
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
      }, { width: 320 });
   }

   /**
    * Prompts the user for data. Handles instantiation, rendering, and follow through
    * 
    * @param {"number" | "text"} data_type - Field type
    * 
    * @param {import('#svelte-fvtt/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    * 
    * @param dialog_data
    *
    * @returns {string | number | null} The value, or null if the user cancelled the prompt
    */
   static async show(data_type, dialog_data = {}) {
      return new RapidPromptApplication(data_type, dialog_data).wait();
   }
}
