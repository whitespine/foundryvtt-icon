import { abilityChoiceToStatus } from "../../config/statuses";
import { easyActionBuilder } from "./util";

export const dragAsDoc = easyActionBuilder({
    dragstart: (options, event) => {
        if (options.doc) {
            event.stopImmediatePropagation();
            event.dataTransfer.setData("text/plain", JSON.stringify(options.doc.toDragData()));
        }
    },
}, (options) => {
    if (options.doc && !(options.doc instanceof foundry.abstract.Document)) {
        throw new TypeError("doc must be a foundry document");
    }
});

export const dragAsMark = easyActionBuilder({
    dragstart: (options, event) => {
        if (options.choice) {
            event.stopImmediatePropagation();
            let mark_data = abilityChoiceToStatus(options.choice);
            event.dataTransfer.setData("text/plain", JSON.stringify(mark_data));
        }
    },
}, (options) => {
    if (options.doc && !(options.doc instanceof foundry.abstract.Document)) {
        throw new TypeError("doc must be a foundry document");
    }
});


