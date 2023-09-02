<svelte:options accessors={true} />

<script>
    import { getContext } from "svelte";

    /**
     * @type {"text" | "number"}
     */
    export let data_type;

    const { application } = getContext("#external");

    const managedPromise = getContext("#managedPromise");

    // Bound to the form element
    let form;

    // Called by confirm button
    export function requestSubmit() {
        form.requestSubmit();
    }

    // Called by cancel button
    export function requestCancel() {
        managedPromise.resolve(null);
        application.close();
    }

    /**
     * Creates a new document from the form data.
     *
     * @returns {Promise<void>}
     */
    async function saveData(event) {
        const fd = new FormDataExtended(event.target);

        managedPromise.resolve(fd.object.value);
        application.close();
    }
</script>

<form bind:this={form} on:submit|preventDefault={saveData} autocomplete="off">
    <div class="form-group">
        <div class="form-fields">
            <input type={data_type} name="value" required />
        </div>
    </div>
</form>
