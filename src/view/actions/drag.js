import { easyActionBuilder } from "./util";

export const dragAsDoc = easyActionBuilder({
    "dragstart": (options, event) => {
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

