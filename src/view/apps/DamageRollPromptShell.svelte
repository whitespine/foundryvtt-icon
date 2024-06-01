<svelte:options accessors={true} />

<script>
    import { getContext } from "svelte";
    import { buildDamageFormula } from "../../util/harm";
    import { ATTACKER } from "../../util/stores/tokens";

    const { application } = getContext("#external");

    const managedPromise = getContext("#managedPromise");

    // Bound to the form element
    let form;

    // Current values
    export let presets = {};
    let dice_count = presets.dice_count ?? 1;
    let fray_count = presets.fray_count ?? 0;
    let flat_bonus = presets.flat_bonus ?? 0;
    let rangiri = false; // Doubles the total rolled result
    let bonus_damage = 0;

    let die;
    $: die = $ATTACKER?.actor?.system.class?.damage_die ?? 6;
    let fray;
    $: fray = $ATTACKER?.actor?.system.class?.fray_damage ?? 2;

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
        // const fd = new FormDataExtended(event.target);
        let formula = buildDamageFormula(die, dice_count, `${fray_count} * ${fray}`, bonus_damage);
        let roll = new Roll(formula);
        roll.roll({ async: false });

        managedPromise.resolve({total: roll.total, result: roll.result});
        application.close();
    }
</script>

<form bind:this={form} on:submit|preventDefault={saveData} autocomplete="off">
    <div class="flexrow">
        <div class="formula-grid">
            <!-- The main formula line -->
            <div class="flexcol">
                <button on:click|preventDefault={() => dice_count++}>
                    <i class="fas fa-plus" />
                </button>
                <span>{dice_count}&lsqb;D{die}&rsqb;</span>
                <button on:click|preventDefault={() => (dice_count = Math.max(0, dice_count - 1))}>
                    <i class="fas fa-minus" />
                </button>
            </div>

            <span>+</span>

            <div class="flexcol">
                <button on:click|preventDefault={() => fray_count++}>
                    <i class="fas fa-plus" />
                </button>
                <span>{fray_count} × fray ({fray})</span>
                <button on:click|preventDefault={() => (fray_count = Math.max(0, fray_count - 1))}>
                    <i class="fas fa-minus" />
                </button>
            </div>

            <span style="grid-area: 2 / 6">+</span>

            <input type="number" bind:value={flat_bonus} required style="grid-area: 2 / 7" />
        </div>
        <div class="flexcol options-grid">
            <div>
                <button on:click|preventDefault={() => bonus_damage++}>
                    <i class="fas fa-plus fa-sm" />
                </button>
                <span>{bonus_damage} × Bonus Damage</span>
                <button on:click|preventDefault={() => (bonus_damage = Math.max(0, bonus_damage - 1))}>
                    <i class="fas fa-minus fa-sm" />
                </button>
            </div>
        </div>
    </div>
</form>

<style lang="scss">
    .formula-grid {
        display: flex;
        flex-direction: row;
        text-align: center;
        justify-content: space-around;

        flex-wrap: nowrap;
        align-items: center;
        gap: 4px;

        border-right: var(--primary-border);

        button {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            i {
                margin-left: auto;
                margin-right: auto;
            }
        }

        input {
            width: 16px;
        }
    }

    .options-grid {
        button {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            i {
                margin-left: auto;
                margin-right: auto;
            }
        }
    }
</style>
