import { readable } from "svelte/store";

export const SIDEBAR_WIDTH = readable(0, update => {
    const sidebar = $("#sidebar");

    function setWidth() {
        update(sidebar.width() || 0);
    }

    setWidth();
    Hooks.on("collapseSidebar", setWidth);
});
