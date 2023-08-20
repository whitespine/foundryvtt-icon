import { ICON } from "../consts";
import { FoeModel } from "../models/actors/foe";
import { PlayerModel } from "../models/actors/player";
import { SummonModel } from "../models/actors/summon";

// Provides a sane default image
export function defaultImage(meta) {
    let name = meta.type; // A special name to perhaps look up
    let type = meta.type; // Player, foe, summon
    let clazz = meta.class; // red, green, blue, yellow
    let job = meta.job; // Full job name

    // First lookup special names

    if (type === "player") {
        return "icons/svg/aura.svg";
    } else if (type === "foe") {
        return "icons/svg/mystery-man.svg";
    } else { // It's a summon, but don't over-restrain
        return "icons/svg/card-joker.svg";
    }
}

/**
 * Our custom class for Icon Actors
 */
export class IconActor extends Actor {

    /** Patch update to preserve arrays */
    async update(data, options = {}) {
        data = this.system.fullUpdateData(data);
        return super.update(data, options);
    }

    /** @override
     * This is overridden to pre-populate with slightly more sensible data,
     * such as nicer icons and default names, token dispositions, etc
     */
    async _preCreate(...[data, options, user]) {
        await super._preCreate(data, options, user);

        console.log(data);

        // Give a decent default icon
        let img = data.img ?? defaultImage({ type: data.type, name: data.name });

        // Set default disposition
        let disposition = data.prototypeToken?.disposition ?? {
            ["foe"]: CONST.TOKEN_DISPOSITIONS.HOSTILE,
            ["player"]: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            ["summon"]: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        }[this.type] ?? CONST.TOKEN_DISPOSITIONS.NEUTRAL;

        // Set default link status
        let actorLink = data.prototypeToken?.actorLink ?? (data.type === "player");

        // Set default bars
        let displayBars = data.prototypeToken?.displayBars;
        if (displayBars === undefined) {
            if (data.type === "player") {
                // Fine for players to see each other
                displayBars = CONST.TOKEN_DISPLAY_MODES.HOVER;
            } else if (data.type === "foe") {
                // Depends on GM preference
                if (game.settings.get(game.system.id, ICON.settings.show_foe_hp)) {
                    displayBars = CONST.TOKEN_DISPLAY_MODES.HOVER;
                } else {
                    displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER;
                }
            } else {
                // Never show for foes
                displayBars = CONST.TOKEN_DISPLAY_MODES.NONE;
            }
        }
        let bar1 = data.prototypeToken?.bar1 ?? {
            attribute: "hp",

        };
        let bar2 = data.prototypeToken?.bar2 ?? {
            attribute: "vigor",

        };

        // Put in the basics
        // @ts-expect-error Should be fixed with v10 types
        this.updateSource({
            img,
            // Link the token to the Actor for pilots and mechs, but not for NPCs or deployables
            prototypeToken: {
                actorLink,
                disposition,
                displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
                displayBars,
                bar1,
                bar2
            },
        });
    }

}