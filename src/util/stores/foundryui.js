import { readable } from "svelte/store";

export const SIDEBAR_LEFT = readable(0, update => {
    const sidebar = document.getElementById("sidebar");

    function doUpdate() {
        update(sidebar.getBoundingClientRect().left || 0);
    }

    doUpdate();
    Hooks.on("collapseSidebar", doUpdate);
});

export const HOTBAR_TOP = readable(0, update => {
    const bottom = document.getElementById("hotbar");

    function doUpdate() {
        update(bottom.getBoundingClientRect().top || 0);
    }

    doUpdate();
    // There's not actually a hook for this
    // Hooks.on("collapseHotbar", doUpdate);
});
