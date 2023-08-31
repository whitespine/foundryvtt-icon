import { setupDocuments } from './config/documents.js';
import { setupModels } from './config/models.js';
import { setupIndexes } from './config/packs.js';
import { setupSettings } from './config/settings.js';
import { setupSheets } from './config/sheets.js';
import { ICON } from './consts.js';
import { IconActor } from './documents/actor.js';
import { IconItem } from './documents/item.js';
import { applyGlobalDragListeners } from './util/dragdrop.js';
import BasicApplication from './view/apps/BasicApplication.js';

import "./icon.scss";
import { SvelteChatLog, setupMessages } from './config/messages.js';
import { setupTransformers } from './util/nlp.js';
import { enhanceStatuses } from './config/statuses.js';
import "./util/harm.js";
import WelcomeApplication from './view/apps/WelcomeApplication.js';

// Import sliding HUD (used for accuracy/difficulty windows)
// import * as slidingHUD from "./module/helpers/slidinghud/index.js";

/* ------------------------------------ */
/* Initialize system                    */
/* ------------------------------------ */
Hooks.once("init", () => {
    console.log(`Initializing ICON RPG System`);

    // Register custom system settings
    setupDocuments();
    setupModels();
    setupIndexes();
    setupSettings();

    // Assign custom classes and constants here
    CONFIG.ui.chat = SvelteChatLog;

    // Create an Icon namespace within the game global
    game.icon = {
        applications: {
            basic: BasicApplication,
            // playIconPlayerSheet,
        },
        sheets: {

        },
        entities: {
            actor: IconActor,
            item: IconItem,
        },
        helpers: {
        },
    };
});

// Make an awaitable for when this shit is done
Hooks.once("ready", async () => {
    console.log(`Foundry ready, doing final checks.`);

    // Register sheet application classes
    setupTransformers();
    setupSheets();
    applyGlobalDragListeners();
    setupDSN();
    setupMessages();
    enhanceStatuses();

    // Show welcome only if they haven't confirmed it before
    if (game.settings.get(game.system.id, ICON.settings.welcome)) {
        new WelcomeApplication().render(true, { focus: true });
    }
});


/**
 *
 */
function setupDSN() {
    // Set up Dice So Nice to icrementally show attacks then damge rolls
    if (game.modules.get("dice-so-nice")?.active && !game.settings.get(game.system.id, ICON.settings.dsn_setup)) {
        console.log(`First login setup for Dice So Nice`);
        game.settings.set("dice-so-nice", "enabledSimultaneousRollForMessage", false);
        game.settings.set(game.system.id, ICON.setting_dsn_setup, true);
    }
}

// ------------------------------------------------------------------------
// Sliding HUD Zone, including accuracy/difficulty window
// Hooks.on("renderHeadsUpDisplay", slidingHUD.attach);
// let openingBasicAttackLock = false;
// Hooks.on("targetToken", (user: User, _token: Token, isNewTarget: boolean) => {
//   if (user.isSelf && isNewTarget && !openingBasicAttackLock) {
//     // this only works because openBasicAttack is a promise and runs on a future tick
//     openingBasicAttackLock = true;
//     macros.openBasicAttack().finally(() => {
//       openingBasicAttackLock = false;
//     });
//   }
// });

// For the settings tab
Hooks.on("renderSettings", async (app, html) => {
    // addSettingsButtons(app, html);
});
Hooks.on("renderCombatTracker", (...[_app, html]) => {
    /*
    html
      .find(".combat-settings")
      .off("click")
      .on("click", ev => {
        ev.preventDefault();
        new LancerCombatTrackerConfig(undefined, {}).render(true);
      });
      */
});

