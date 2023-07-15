<script>
    import { getContext } from "svelte";

    export let actor;
</script>


<form class="flexcol {cssClass}" autocomplete="off">
    <!-- Sheet Header -->
    <header class="icon-sheet-header icon-header-grid">
        <img class="profile-img icon-header-grid-item-1" src="{actor.img}" data-edit="img" title="{actor.name}" height="100" width="100" />
        <div class="header-fields flex-group-center icon-header-grid-item-2">
            <h1 class="charname">
                <input name="name" type="text" value="{actor.name}" placeholder="Name" />
            </h1>
		</div>
		<div class="narrative-information icon-header-grid-item-3">
			<span>{localize("ICON.Kintype")}: </span>
			<input type="text" name="system.attributes.information.kintype.value" placeholder="Arken" value="{actor.system.attributes.information.kintype.value}"/>
			<span>{localize("ICON.Culture")}: </span>
			<input type="text" name="system.attributes.information.culture.value" placeholder="Arken" value="{actor.system.attributes.information.culture.value}"/>
			<span>{localize("ICON.Bond")}: </span>
			<input type="text" name="system.attributes.information.bond.value" placeholder="Arkenlord" value="{actor.system.attributes.information.bond.value}"/>
		</div>
		<div class="tactical-information icon-header-grid-item-4">
			<span>{localize("ICON.Class")}: </span>
			<input type="text" name="system.attributes.information.class.value" placeholder="Mendicant" value="{actor.system.attributes.information.class.value}"/>
			<span>{localize("ICON.Job")}: </span>
			<input type="text" name="system.attributes.information.job.value" placeholder="Seer" value="{actor.system.attributes.information.job.value}"/>
			<span>{localize("ICON.Level")}: </span>
			<input type="text" name="system.attributes.information.level.value" placeholder="1" value="{actor.system.attributes.information.level.value}"/>
		</div>
		<div class="icon-resource-inputs icon-header-grid-item-5">
            <div class="icon-resource">
				<label for="actor.health.value" class="resource-label">{localize("ICON.Health")}</label>
                <input type="number" name="system.health.value" value="{systemactor.health.value}"/>
                <span> / </span>
                <input type="number" name="system.health.max" value="{systemactor.health.max}"/>
            </div>
            <div class="icon-resource">
				<label for="actor.power.value" class="resource-label">{localize("ICON.JobResource")}</label>
                <input type="number" name="system.power.value" value="{systemactor.power.value}"/>
                <span> / </span>
                <input type="number" name="system.power.max" value="{systemactor.power.max}"/>
            </div>
			<div class="icon-resource">
				<label for="actor.strain.value" class="resource-label">{localize("ICON.Strain")}</label>
                <input type="number" name="system.strain.value" value="{systemactor.strain.value}"/>
                <span> / </span>
                <input type="number" name="system.strain.max" value="{systemactor.strain.max}"/>
            </div>
            <div class="icon-resource">
				<label for="actor.effort.value" class="resource-label">{localize("ICON.Effort")}</label>
                <input type="number" name="system.effort.value" value="{systemactor.effort.value}"/>
                <span> / </span>
                <input type="number" name="system.effort.max" value="{systemactor.effort.max}"/>
            </div>
		</div>
    </header>

    <!-- Sheet Tab Navigation -->
    <nav class="sheet-tabs tabs" actor-group="primary">
		<a class="item" actor-tab="narrative" actor-group="primary">{localize("ICON.Narrative")}</a>
        <a class="item" actor-tab="traits" actor-group="primary">{localize("ICON.Traits-Relics")}</a>
        <a class="item" actor-tab="items" actor-group="primary">{localize("ICON.AbilitiesTrophies")}</a>
        <a class="item" actor-tab="attributes" actor-group="primary">{localize("ICON.Attributes")}</a>
    </nav>

    <!-- Sheet Body -->
    <section class="sheet-body">

		<!-- Narrative Tab -->
        <div class="tab narrative" actor-group="primary" actor-tab="narrative">
		<div class="narrative-grid">
		<section class="skills">
        {#if actor.system.attributes.skills }
		{#each actor.system.attributes.skills as |skill skill_name|}
		{#times_from_0 4}
		<i class="{#if (eq this 0)}
		fab fa-creative-commons-zero
		{else if (gte skill.value this)}
		fas fa-circle
		{else}
		fas fa-circle-dashed
		{/if} click-to-set skill-ratings skill-value-{this}" actor-value="{this}" actor-stat="system.attributes.skills.{skill_name}.value" id="attributes-{../../actor._id}-{skill_name}-{this}"></i>
		<label for="attributes-{../../actor._id}-{skill_name}-{this}"></label>
		{/times_from_0}
		<div class="skill-label roll-die-attribute rollable-text" actor-roll-attribute="{skill_name}">{localize skill.label}</div>
		{/each}
		{/if}
		</section>
		<section class="XPDust">
		<div class="XP-and-Dust">
		<div class="XP-value">
		<span>{localize("ICON.XP")}</span>
		{#times_from_0 15}
		<i class="{#if (eq this 0)}
		fab fa-creative-commons-zero
		{else if (gte ../actor.system.attributes.information.XP.value this)}
		fas fa-circle
		{else}
		fas fa-circle-dashed
		{/if} click-to-set XP-value-{this}" actor-value="{this}" actor-stat="system.attributes.information.XP.value" id="attributes-XP-{this}"></i>
		<label for="attributes-XP-{this}"></label>
		{/times_from_0}
		</div>
		<div class="Dust-value">
		<span>{localize("ICON.Dust")}</span>
		{#times_from_0 8}
		<i class="{#if (eq this 0)}
		fab fa-creative-commons-zero
		{else if (gte ../actor.system.attributes.information.Dust.value this)}
		fas fa-circle
		{else}
		fas fa-circle-dashed
		{/if} click-to-set Dust-value-{this}" actor-value="{this}" actor-stat="system.attributes.information.Dust.value" id="attributes-Dust-{this}"></i>
		<label for="attributes-Dust-{this}"></label>
		{/times_from_0}
		</div>
		</div>
		</section>
		<section class="burdens">
		<div class="character-burden-clock">
		{{blades-clock "system.attributes.clocks.Burden4.value" 4 this.actor.system.attributes.clocks.Burden4.value this.actor._id "gms_red"}}
		{{blades-clock "system.attributes.clocks.Burden6.value" 6 this.actor.system.attributes.clocks.Burden6.value this.actor._id "gms_red"}}
		{{blades-clock "system.attributes.clocks.Burden8.value" 8 this.actor.system.attributes.clocks.Burden8.value this.actor._id "gms_red"}}
		</div>
		<div class="burden-names">
		<textarea rows="10" cols="30" name="system.attributes.clocks.Burden4Name.value" value="{actor.system.attributes.clocks.Burden4Name.value}"/>{actor.system.attributes.clocks.Burden4Name.value}</textarea>
		<textarea rows="10" cols="30" name="system.attributes.clocks.Burden6Name.value" value="{actor.system.attributes.clocks.Burden6Name.value}"/>{actor.system.attributes.clocks.Burden6Name.value}</textarea>
		<textarea rows="10" cols="30" name="system.attributes.clocks.Burden8Name.value" value="{actor.system.attributes.clocks.Burden8Name.value}"/>{actor.system.attributes.clocks.Burden8Name.value}</textarea>
		</div>
		</section>
		<section class="ambitions">
		<div class="character-burden-clock">
		{{blades-clock "system.attributes.clocks.Ambition4.value" 4 this.actor.system.attributes.clocks.Ambition4.value this.actor._id "wallflower_green"}}
		{{blades-clock "system.attributes.clocks.Ambition6.value" 6 this.actor.system.attributes.clocks.Ambition6.value this.actor._id "wallflower_green"}}
		{{blades-clock "system.attributes.clocks.Ambition10.value" 10 this.actor.system.attributes.clocks.Ambition10.value this.actor._id "wallflower_green"}}
		</div>
		<div class="ambition-names">
		<textarea rows="10" cols="30" name="system.attributes.clocks.Ambition4Name.value" value="{actor.system.attributes.clocks.Ambition4Name.value}">{actor.system.attributes.clocks.Ambition4Name.value}</textarea>
		<textarea rows="10" cols="30" name="system.attributes.clocks.Ambition6Name.value" value="{actor.system.attributes.clocks.Ambition6Name.value}"/>{actor.system.attributes.clocks.Ambition6Name.value}</textarea>
		<textarea rows="10" cols="30" name="system.attributes.clocks.Ambition10Name.value" value="{actor.system.attributes.clocks.Ambition10Name.value}"/>{actor.system.attributes.clocks.Ambition10Name.value}</textarea>
		</div>
		</section>
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
		<textarea rows="10" cols="30" name="system.attributes.information.SecondWind.value" value="{actor.system.attributes.information.SecondWind.value}">{actor.system.attributes.information.SecondWind.value}</textarea>
		</div>
		<div class="Special-Ability">
		<span>{localize("ICON.SpecialAbility")}</span>
		<textarea rows="10" cols="30" name="system.attributes.information.SpecialAbility.value" value="{actor.system.attributes.information.SpecialAbility.value}">{actor.system.attributes.information.SpecialAbility.value}</textarea>
		</div>
		<div class="Ideals">
		<span>{localize("ICON.Ideals")}</span>
		<textarea rows="10" cols="30" name="system.attributes.information.Ideals.value" value="{actor.system.attributes.information.Ideals.value}">{actor.system.attributes.information.Ideals.value}</textarea>
		</div>
		</div>
		
		<div class="tab gear" actor-group="bond" actor-tab="gear">
		
		
		
		<div class="AdventurerKit">
		<span>Adventurer's Kit</span>
		<textarea rows="10" cols="30" name="system.attributes.information.AdventurersKit.value" value="{actor.system.attributes.information.AdventurersKit.value}">{actor.system.attributes.information.AdventurersKit.value}</textarea>
		</div>
		<div class="OtherKit">
		<span>Other Kit</span>
		<textarea rows="10" cols="30" name="system.attributes.information.OtherKit.value" value="{actor.system.attributes.information.OtherKit.value}">{actor.system.attributes.information.OtherKit.value}</textarea>
		</div>
		<div class="LooseGear">
		<span>Loose Gear</span>
		<textarea rows="10" cols="30" name="system.attributes.information.LooseGear.value" value="{actor.system.attributes.information.LooseGear.value}">{actor.system.attributes.information.LooseGear.value}</textarea>
		</div>
		
		</div>
		
		<div class="tab bond-powers" actor-group="bond" actor-tab="bond-powers">
		
		
		<ol class="item-list">
                {#each actor.items as |item id|}
				{#if item.isBondPower }
                <li class="item flexrow" actor-item-id="{item._id}">
                    <img src="{item.img}" title="{item.name}" width="24" height="24" />
                    <h4 class="item-name">{item.name}</h4>
                    <!-- Iterate through all attributes on the item and output buttons for any that are formula. -->
                    <div class="item-buttons">
                        {#each item.system.attributes as |itemAttr key|}
                        {#if itemAttr.dtype}
                            {#if itemAttr.isFormula}
                                <!-- Use the items.name.key format for shorthand. -->
                                {#if ../../shorthand}
                                <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                <!-- Use the items.name.attributes.key.value format otherwise. -->
                                {else}
                                <button class="item-button rollable"
                                    actor-roll="@items.{slugify item.name}.attributes.{key}.value" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                {/if}
                            {/if}
                        {else}
                            {#each itemAttr as |itemGroupedAttr groupedKey|}
                                {#if itemGroupedAttr.isFormula}
                                    <!-- Use the items.name.key format for shorthand. -->
                                    {#if ../../../shorthand}
                                    <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}.{groupedKey}" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    <!-- Use the items.name.attributes.key.value format otherwise. -->
                                    {else}
                                    <button class="item-button rollable"
                                        actor-roll="@items.{slugify item.name}.attributes.{key}.{groupedKey}.value" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    {/if}
                                {/if}
                            {/each}
                        {/if}
                        {/each}
						{#each item.Talents}
						<label>
						<input type="checkbox" actor-id="{item._id}" class="talent-checkbox" actor-type="{this.name}" {checked this.value }>
						</label><br>
						{/each}
                    </div>
                    <div class="bond-power-controls">
                        <a class="bond-power-control" title="{ localize("SIMPLE.ItemEdit") }" actor-action="edit"><i class="fas fa-edit"></i></a>
                        <a class="bond-power-control" title="{ localize("SIMPLE.ItemDelete") }" actor-action="delete"><i class="fas fa-trash"></i></a>
                    </div>
                </li>
                {/if}
				{/each}
            </ol>
            <p>
                <a class="bond-power-control" title="{ localize("SIMPLE.ItemCreate") }" actor-action="create"><i class="fas fa-plus"></i> { localize("SIMPLE.ItemCreate") }</a>
            </p>
		
		
		</div>
		</section>
		</section>
		</div>
        </div>
		
		<!-- Traits & Relics Tab -->
        <div class="tab traits" actor-group="primary" actor-tab="traits">
		<div class="traitsrelics">
		<div class="traitheader">
		<span>Traits</span>
		</div>
            <ol class="item-list">
                {#each actor.items as |item id|}
				{#if item.isTrait }
                <li class="item flexrow" actor-item-id="{item._id}">
                    <img src="{item.img}" title="{item.name}" width="24" height="24" />
                    <h4 class="item-name">{item.name}</h4>
                    <!-- Iterate through all attributes on the item and output buttons for any that are formula. -->
                    <div class="item-buttons">
                        {#each item.system.attributes as |itemAttr key|}
                        {#if itemAttr.dtype}
                            {#if itemAttr.isFormula}
                                <!-- Use the items.name.key format for shorthand. -->
                                {#if ../../shorthand}
                                <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                <!-- Use the items.name.attributes.key.value format otherwise. -->
                                {else}
                                <button class="item-button rollable"
                                    actor-roll="@items.{slugify item.name}.attributes.{key}.value" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                {/if}
                            {/if}
                        {else}
                            {#each itemAttr as |itemGroupedAttr groupedKey|}
                                {#if itemGroupedAttr.isFormula}
                                    <!-- Use the items.name.key format for shorthand. -->
                                    {#if ../../../shorthand}
                                    <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}.{groupedKey}" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    <!-- Use the items.name.attributes.key.value format otherwise. -->
                                    {else}
                                    <button class="item-button rollable"
                                        actor-roll="@items.{slugify item.name}.attributes.{key}.{groupedKey}.value" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    {/if}
                                {/if}
                            {/each}
                        {/if}
                        {/each}
						{#each item.Talents}
						<label>
						<input type="checkbox" actor-id="{item._id}" class="talent-checkbox" actor-type="{this.name}" {checked this.value }>
						</label><br>
						{/each}
                    </div>
                    <div class="trait-controls">
                        <a class="trait-control" title="{ localize("SIMPLE.ItemEdit") }" actor-action="edit"><i class="fas fa-edit"></i></a>
                        <a class="trait-control" title="{ localize("SIMPLE.ItemDelete") }" actor-action="delete"><i class="fas fa-trash"></i></a>
                    </div>
                </li>
                {/if}
				{/each}
            </ol>
            <p>
                <a class="trait-control" title="{ localize("SIMPLE.ItemCreate") }" actor-action="create"><i class="fas fa-plus"></i> { localize("SIMPLE.ItemCreate") }</a>
            </p>
        </div>
		<hr>
		<div class="tab relics" actor-group="primary" actor-tab="traits">
		<div class="traitheader">
		<span>Relics<span>
		</div>
            <ol class="item-list">
                {#each actor.items as |item id|}
				{#if item.isRelic }
                <li class="item flexrow" actor-item-id="{item._id}">
                    <img src="{item.img}" title="{item.name}" width="24" height="24" />
                    <h4 class="item-name">{item.name}</h4>
                    <!-- Iterate through all attributes on the item and output buttons for any that are formula. -->
                    <div class="item-buttons">
                        {#each item.system.attributes as |itemAttr key|}
                        {#if itemAttr.dtype}
                            {#if itemAttr.isFormula}
                                <!-- Use the items.name.key format for shorthand. -->
                                {#if ../../shorthand}
                                <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                <!-- Use the items.name.attributes.key.value format otherwise. -->
                                {else}
                                <button class="item-button rollable"
                                    actor-roll="@items.{slugify item.name}.attributes.{key}.value" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                {/if}
                            {/if}
                        {else}
                            {#each itemAttr as |itemGroupedAttr groupedKey|}
                                {#if itemGroupedAttr.isFormula}
                                    <!-- Use the items.name.key format for shorthand. -->
                                    {#if ../../../shorthand}
                                    <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}.{groupedKey}" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    <!-- Use the items.name.attributes.key.value format otherwise. -->
                                    {else}
                                    <button class="item-button rollable"
                                        actor-roll="@items.{slugify item.name}.attributes.{key}.{groupedKey}.value" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    {/if}
                                {/if}
                            {/each}
                        {/if}
                        {/each}
						{#each item.Talents}
						<label>
						<input type="checkbox" actor-id="{item._id}" class="talent-checkbox" actor-type="{this.name}" {checked this.value }>
						</label><br>
						{/each}
                    </div>
                    <div class="relic-controls">
                        <a class="relic-control" title="{ localize("SIMPLE.ItemEdit") }" actor-action="edit"><i class="fas fa-edit"></i></a>
                        <a class="relic-control" title="{ localize("SIMPLE.ItemDelete") }" actor-action="delete"><i class="fas fa-trash"></i></a>
                    </div>
                </li>
                {/if}
				{/each}
            </ol>
            <p>
                <a class="relic-control" title="{ localize("SIMPLE.ItemCreate") }" actor-action="create"><i class="fas fa-plus"></i> { localize("SIMPLE.ItemCreate") }</a>
            </p>
        </div>
		</div>

        <!-- Abilities & Trophies Tab -->
        <div class="tab items" actor-group="primary" actor-tab="items">
		<div class="CombatBar">
		<div class="Personal Resolve">
		<span>Personal Resolve</span>
		{#times_from_0 5}
		<i class="{#if (eq this 0)}
		fab fa-creative-commons-zero
		{else if (gte ../actor.system.attributes.information.PersonalResolve.value this)}
		fas fa-circle
		{else}
		fas fa-circle-dashed
		{/if} click-to-set PersonalResolve-value-{this}" actor-value="{this}" actor-stat="system.attributes.information.PersonalResolve.value" id="attributes-PersonalResolve-{this}"></i>
		<label for="attributes-PersonalResolve-{this}"></label>
		{/times_from_0}
		</div>
		<div class="Wounds">
		<span>Wounds</span>
		{#times_from_0 4}
		<i class="{#if (eq this 0)}
		fab fa-creative-commons-zero
		{else if (gte ../actor.system.attributes.information.Wounds.value this)}
		fas fa-circle
		{else}
		fas fa-circle-dashed
		{/if} click-to-set Wounds-value-{this}" actor-value="{this}" actor-stat="system.attributes.information.Wounds.value" id="attributes-Wounds-{this}"></i>
		<label for="attributes-Wounds-{this}"></label>
		{/times_from_0}
		</div>
		</div>
		<div class="abilities">
		<div class="traitheader">
		<span>Abilities</span>
		</div>
            <ol class="item-list">
                {#each actor.items as |item id|}
				{#if (and (not item.isBondPower) (not item.isTrait) (not item.isCampFixture) (not item.isTrophy) (not item.isRelic)) }
                <li class="item flexrow" actor-item-id="{item._id}">
                    <img src="{item.img}" title="{item.name}" width="24" height="24" />
                    <h4 class="item-name">{item.name}</h4>
                    <!-- Iterate through all attributes on the item and output buttons for any that are formula. -->
                    <div class="item-buttons">
                        {#each item.system.attributes as |itemAttr key|}
                        {#if itemAttr.dtype}
                            {#if itemAttr.isFormula}
                                <!-- Use the items.name.key format for shorthand. -->
                                {#if ../../shorthand}
                                <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                <!-- Use the items.name.attributes.key.value format otherwise. -->
                                {else}
                                <button class="item-button rollable"
                                    actor-roll="@items.{slugify item.name}.attributes.{key}.value" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                {/if}
                            {/if}
                        {else}
                            {#each itemAttr as |itemGroupedAttr groupedKey|}
                                {#if itemGroupedAttr.isFormula}
                                    <!-- Use the items.name.key format for shorthand. -->
                                    {#if ../../../shorthand}
                                    <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}.{groupedKey}" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    <!-- Use the items.name.attributes.key.value format otherwise. -->
                                    {else}
                                    <button class="item-button rollable"
                                        actor-roll="@items.{slugify item.name}.attributes.{key}.{groupedKey}.value" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    {/if}
                                {/if}
                            {/each}
                        {/if}
                        {/each}
						{#each item.Talents}
						<label>
						<input type="checkbox" actor-id="{item._id}" class="talent-checkbox" actor-type="{this.name}" {checked this.value }>
						</label><br>
						{/each}
                    </div>
                    <div class="item-controls">
                        <a class="item-control" title="{ localize("SIMPLE.ItemEdit") }" actor-action="edit"><i class="fas fa-edit"></i></a>
                        <a class="item-control" title="{ localize("SIMPLE.ItemDelete") }" actor-action="delete"><i class="fas fa-trash"></i></a>
                    </div>
                </li>
				{/if}
                {/each}
            </ol>
            <p>
                <a class="item-control" title="{ localize("SIMPLE.ItemCreate") }" actor-action="create"><i class="fas fa-plus"></i> { localize("SIMPLE.ItemCreate") }</a>
            </p>
        </div>
		<hr>
		<div class="Trophies">
		<div class="traitheader">
		<span>Trophies</span>
		</div>
		<ol class="item-list">
                {#each actor.items as |item id|}
				{#if item.isTrophy }
                <li class="item flexrow" actor-item-id="{item._id}">
                    <img src="{item.img}" title="{item.name}" width="24" height="24" />
                    <h4 class="item-name">{item.name}</h4>
                    <!-- Iterate through all attributes on the item and output buttons for any that are formula. -->
                    <div class="item-buttons">
                        {#each item.system.attributes as |itemAttr key|}
                        {#if itemAttr.dtype}
                            {#if itemAttr.isFormula}
                                <!-- Use the items.name.key format for shorthand. -->
                                {#if ../../shorthand}
                                <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                <!-- Use the items.name.attributes.key.value format otherwise. -->
                                {else}
                                <button class="item-button rollable"
                                    actor-roll="@items.{slugify item.name}.attributes.{key}.value" actor-label="{ itemAttr.label }"
                                    title="{itemAttr.value}">{itemAttr.label}</button>
                                {/if}
                            {/if}
                        {else}
                            {#each itemAttr as |itemGroupedAttr groupedKey|}
                                {#if itemGroupedAttr.isFormula}
                                    <!-- Use the items.name.key format for shorthand. -->
                                    {#if ../../../shorthand}
                                    <button class="item-button rollable" actor-roll="@items.{slugify item.name}.{key}.{groupedKey}" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    <!-- Use the items.name.attributes.key.value format otherwise. -->
                                    {else}
                                    <button class="item-button rollable"
                                        actor-roll="@items.{slugify item.name}.attributes.{key}.{groupedKey}.value" actor-label="{ itemGroupedAttr.label }"
                                        title="{itemGroupedAttr.value}">{itemGroupedAttr.label}</button>
                                    {/if}
                                {/if}
                            {/each}
                        {/if}
                        {/each}
						{#each item.Talents}
						<label>
						<input type="checkbox" actor-id="{item._id}" class="talent-checkbox" actor-type="{this.name}" {checked this.value }>
						</label><br>
						{/each}
                    </div>
                    <div class="item-controls">
                        <a class="trophy-control" title="{ localize("SIMPLE.ItemEdit") }" actor-action="edit"><i class="fas fa-edit"></i></a>
                        <a class="trophy-control" title="{ localize("SIMPLE.ItemDelete") }" actor-action="delete"><i class="fas fa-trash"></i></a>
                    </div>
                </li>
				{/if}
                {/each}
            </ol>
            <p>
                <a class="trophy-control" title="{ localize("SIMPLE.ItemCreate") }" actor-action="create"><i class="fas fa-plus"></i> { localize("SIMPLE.ItemCreate") }</a>
            </p>
		</div>
		</div>

        <!-- Attributes Tab -->
        <div class="tab attributes" actor-group="primary" actor-tab="attributes">
            <header class="attributes-header flexrow">
                <span class="attribute-key">{localize("SIMPLE.AttributeKey")}</span>
                <span class="attribute-value">{localize("SIMPLE.AttributeValue")}</span>
                <span class="attribute-label">{localize("SIMPLE.AttributeLabel")}</span>
                <span class="attribute-dtype">{localize("SIMPLE.AttributeDtype")}</span>
                <a class="attribute-control" actor-action="create" actor-group="{group}"><i class="fas fa-plus"></i></a>
            </header>

            <!-- Render the attribute list partial. -->
            {> "modules/icon_actor/templates/parts/icon-sheet-attributes.html" attributes=systemactor.ungroupedAttributes dtypes=dtypes}

            <!-- Render the grouped attributes partial and control. -->
            <div class="groups">
                {> "modules/icon_actor/templates/parts/icon-sheet-groups.html" attributes=systemactor.groupedAttributes groups=systemactor.groups dtypes=dtypes}

                <div class="group-controls flexrow">
                    <input class="group-prefix" type="text" value=""/>
                    <a class="button group-control" actor-action="create-group"><i class="fas fa-plus"></i>Add Attribute Group</a>
                </div>
            </div>
        </div>
    </section>
</form>
<style lang="scss">
</style>