import { TJSDialog } from '#runtime/svelte/application';
import { RapidPromptApplication } from './RapidPromptApplication';

export class BoonBaneApplication extends TJSDialog {
    static async promptBoonBane(data = {}, options = {}) {
        return this.wait({
            ...data,
            buttons: {
                bane2: {
                    icon: "fas fa-layer-minus",
                    label: "-2 Bane",
                    onPress: () => -2
                },
                bane1: {
                    icon: "fas fa-circle-minus",
                    label: "-1 Bane",
                    onPress: () => -1
                },
                neutral: {
                    icon: "fas fa-equals",
                    label: "Standard",
                    onPress: () => 0
                },
                boon1: {
                    icon: "fas fa-circle-plus",
                    label: "+1 Boon",
                    onPress: () => 1
                },
                boon2: {
                    icon: "fas fa-layer-plus",
                    label: "+2 Boon",
                    onPress: () => 2
                },
                custom: {
                    icon: "fas fa-question",
                    label: "Custom",
                    onPress: () => RapidPromptApplication.show("number", { title: "Custom Boon/Bane" })
                }

            },
            default: 'neutral'
        }, options);
    }
}