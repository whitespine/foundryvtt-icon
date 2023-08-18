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

export const dragAsMark = easyActionBuilder({
    "dragstart": (options, event) => {
        if (options.doc) {
            event.stopImmediatePropagation();
            let mark_data = {
                type: "Effect",
                name: options.doc.name,
                statuses: [options.doc.name],
                icon: options.doc.img,
                origin: options.doc.uuid
            };
            event.dataTransfer.setData("text/plain", JSON.stringify(mark_data));
        }
    },
}, (options) => {
    if (options.doc && !(options.doc instanceof foundry.abstract.Document)) {
        throw new TypeError("doc must be a foundry document");
    }
});


