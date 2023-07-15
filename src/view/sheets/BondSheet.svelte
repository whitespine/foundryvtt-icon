<section class="bond">
    <nav class="bond-tabs tabs" actor-group="bond">
        <a class="item" actor-tab="bond-info" actor-group="bond">{localize("ICON.NarrativeInfo")}</a>
        <a class="item" actor-tab="gear" actor-group="bond">Gear</a>
        <a class="item" actor-tab="bond-powers" actor-group="bond">{localize("ICON.BondPowers")}</a>
    </nav>

    <section class="bond-body">
        <div class="tab bond-info active" actor-group="bond" actor-tab="bond-info">
            <div class="Second-Wind">
                <span>{localize("ICON.SecondWind")}</span>
                <textarea
                    rows="10"
                    cols="30"
                    name="system.attributes.information.SecondWind.value"
                    value={actor.system.attributes.information.SecondWind.value}
                />
            </div>
            <div class="Special-Ability">
                <span>{localize("ICON.SpecialAbility")}</span>
                <textarea
                    rows="10"
                    cols="30"
                    name="system.attributes.information.SpecialAbility.value"
                    value={actor.system.attributes.information.SpecialAbility.value}
                />
            </div>
            <div class="Ideals">
                <span>{localize("ICON.Ideals")}</span>
                <textarea
                    rows="10"
                    cols="30"
                    name="system.attributes.information.Ideals.value"
                    value={actor.system.attributes.information.Ideals.value}
                    >{actor.system.attributes.information.Ideals.value}</textarea
                >
            </div>
        </div>

        <div class="tab gear" actor-group="bond" actor-tab="gear">
            <div class="AdventurerKit">
                <span>Adventurer's Kit</span>
                <textarea
                    rows="10"
                    cols="30"
                    name="system.attributes.information.AdventurersKit.value"
                    value={actor.system.attributes.information.AdventurersKit.value}
                    >{actor.system.attributes.information.AdventurersKit.value}</textarea
                >
            </div>
            <div class="OtherKit">
                <span>Other Kit</span>
                <textarea
                    rows="10"
                    cols="30"
                    name="system.attributes.information.OtherKit.value"
                    value={actor.system.attributes.information.OtherKit.value}
                    >{actor.system.attributes.information.OtherKit.value}</textarea
                >
            </div>
            <div class="LooseGear">
                <span>Loose Gear</span>
                <textarea
                    rows="10"
                    cols="30"
                    name="system.attributes.information.LooseGear.value"
                    value={actor.system.attributes.information.LooseGear.value}
                    >{actor.system.attributes.information.LooseGear.value}</textarea
                >
            </div>
        </div>

        <div class="tab bond-powers" actor-group="bond" actor-tab="bond-powers">
            <ol class="item-list" />
        </div>
    </section>
</section>
