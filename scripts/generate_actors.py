import json
import re
from dataclasses import dataclass
from typing import Dict, Optional, List, Union
import os
import pathlib
import random
import string
import copy

# Useful path
proj_root = pathlib.Path(__file__).parent.parent
foe_root = proj_root / "IconFoeJson" / "data"
pack_root = proj_root / "packs"

random.seed(1)

# Roman numerals
CHPT = {1: "I", 2: "Ⅱ", 3: "Ⅲ"}


# Generator which walks all of our actor json file
def walk_files(base):
    for root, dirs, files in os.walk(base):
        yield from (os.path.join(root, f) for f in files)


# Generate a random id
def random_id():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=16))


# If something might or might not be a list, ensure it is
def mandate_list(val):
    if val is None:
        return []
    elif isinstance(val, list):
        return val
    else:
        return [val]


# Converts camel case to snake case
def camel_to_snake(name):
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


# Returns the same dict but everything recursively downcased
def recursive_downcase(input):
    if isinstance(input, list):
        return [recursive_downcase(v) for v in input]
    elif isinstance(input, dict):
        return dict(
            (camel_to_snake(k), recursive_downcase(v)) for k, v in input.items()
        )
    else:
        return input


# Formats long-form descriptions into a single thing
def combine_list_desc(
    base_description: str, listed_descriptions: Union[None, str, List[str]]
):
    long_desc = ""
    if mandate_list(listed_descriptions):
        li = []
        for i in listed_descriptions:
            body = f"{i['description']}"
            if i["name"]:
                body = f"{i['name']}: {body}"
            li.append(f"<li>{body}</li>")
        long_desc = f"<br><ul>{''.join(li)}</ul>"
    return base_description + long_desc


class Processor:
    def __init__(self) -> None:
        # Tracks our top level data
        self.raw_traits = {}
        self.raw_units = {}
        self.created_summons = {}

    def ingest_all_raw(self) -> None:
        """
        Ingest all raw data to our raw_traits and raw_units properties
        """
        for path in walk_files(foe_root):
            if "traits.json" in path:
                with open(path) as f:
                    for rt in json.load(f):
                        rt = recursive_downcase(rt)
                        self.raw_traits[rt["name"]] = rt
            else:
                with open(path) as f:
                    loaded = json.load(f)
                    loaded = recursive_downcase(loaded)
                    self.raw_units[loaded["name"]] = loaded

    def inherit_into(self, target: Dict, source: Dict) -> Dict:
        """
        Merges source into target. Neither input is edited.
        Values from target are prioritized, but in the case of arrays will appear last
        """
        target = copy.deepcopy(target)
        source = copy.deepcopy(source)

        def _sub_inherit_list(key):
            target[key] = mandate_list(source.get(key)) + mandate_list(target.get(key))

        def _sub_inherit_attr(key):
            if key in source and key not in target:
                target[key] = source[key]

        # Combine traits, actions, conditional abilities
        _sub_inherit_list("traits")
        _sub_inherit_list("setup_traits")
        _sub_inherit_list("actions")
        _sub_inherit_list("conditional_abilities")

        # Inherit stats
        _sub_inherit_attr("class")
        _sub_inherit_attr("vitality")
        _sub_inherit_attr("speed")
        _sub_inherit_attr("defense")
        _sub_inherit_attr("fray_damage")
        _sub_inherit_attr("damage_die")

        # Finally handle recursion
        for super_source in mandate_list(source.get("inherits")):
            super_source = self.raw_units[super_source]
            target = self.inherit_into(target, super_source)

        return target

    # Lookup a trait or substitute a default
    def get_trait(self, trait):
        if trait in self.raw_traits:
            return copy.deepcopy(self.raw_traits[trait])
        else:
            return {"name": trait, "description": "No description."}

    def process(self):
        """
        Creates files for all intaken raw units
        """
        # Begin building
        for _name, data in self.raw_units.items():
            # Skip templates
            if data.get("type") == "Template":
                continue

            self.process_foe(data)

    def process_foe(self, data):
        """
        Processes an individual actor
        """
        ap = ActorProcessor(self, data)
        ap.process_as_foe()
        return ap

    def process_summon(self, data):
        """
        Processes an individual actor
        """
        key = data.get("name")
        if key in self.created_summons:
            return self.created_summons[key]
        ap = ActorProcessor(self, data)
        ap.process_as_summon()
        self.created_summons[key] = ap
        return ap


class ActorProcessor:
    """
    Stateful processor for ingesting actors
    """

    def __init__(self, processor: Processor, data: Dict) -> None:
        self.parent = processor
        self.data = data
        self.name = data.get("name", "Unknown")
        self.id = random_id()
        self.system = {}
        self.item_ids = []
        self.type = None

        # These accumulate and can be edited before actually being turned to items
        self.actions = []
        self.traits = []

    def raw_inherit(self):
        """
        Handle inheritance on our raw data
        """
        for super_source in mandate_list(self.data.get("inherits")):
            super_source = self.parent.raw_units[super_source]
            self.data = self.parent.inherit_into(self.data, super_source)

    def hydrate_traits(self):
        """
        Fills out the trait data on all traits on this
        """
        # Populate traits
        traits = [*set(mandate_list(self.data.get("traits")))]
        for t in traits:
            if isinstance(t, str):
                t = self.parent.get_trait(t)
            self.traits.append(t)

    def process_setup_info(self):
        """
        Processes our metadata for foe setup
        """
        # Add setup traits, post process to combine listed descriptions into descriptions
        setup = []
        for t in mandate_list(self.data.get("setup_traits")):
            base = f"<h2>{t['name']}</h2><br>" + t.get("description", "")
            full = combine_list_desc(base, t.get("listed_items"))
            setup.append(f"<p>{full}</p>")
        self.system["setup"] = "\n\n".join(setup)

    def process_conditional_abilities(self):
        for cond_ability in mandate_list(self.data.get("conditional_abilities")):
            # Check special classes, ignore those that don't apply
            add_reqs = []
            if cond_ability.get("is_special_classes"):
                add_reqs.append(f"Must be a {cond_ability['is_special_classes']}")
            if cond_ability.get("is_not_special_classes"):
                add_reqs.append(
                    f"Must not be a {cond_ability['is_not_special_classes']}"
                )
            if cond_ability.get("uses_special_template"):
                add_reqs.append(f"Must be a {cond_ability['uses_special_template']}")

            # If remov traits specified, don't actually remove, but instead mark as explicitly chaptered
            """
            for removal_target in mandate_list(cond_ability.get("remove_traits")):
                # Find the trait with the same name
                corr_trait = ([x for x in self.traits if x["name"] == removal_target])[0]
                # Mark it
                if "chapter" in cond_ability:
                    corr_trait["remove_at_chapter"] = cond_ability["chapter"]

            # Same for actions
            for removal_target in mandate_list(cond_ability.get("remove_actions")):
                # Find the trait with the same name
                corr_action = [x for x in self.actions if x["name"] == removal_target][0]
                # Mark it
                if "chapter" in cond_ability:
                    corr_action["remove_at_chapter"] = cond_ability["chapter"]
            """

            # Add traits, mark similarly
            for add_target in mandate_list(cond_ability.get("traits")):
                if isinstance(add_target, str):
                    add_target = self.parent.get_trait(add_target)
                if "chapter" in cond_ability:
                    chpt = cond_ability["chapter"]
                    add_target["chapter"] = chpt
                add_target["special_requirements"] = add_reqs
                self.traits.append(add_target)

            # Add actions, mark similarly
            for add_target in mandate_list(cond_ability.get("actions")):
                if "chapter" in cond_ability:
                    chpt = cond_ability["chapter"]
                    add_target["chapter"] = chpt
                add_target["special_requirements"] = add_reqs
                self.actions.append(add_target)

    def process_as_summon(self):
        self.type = "summon"
        self.system["is_object"] = self.data.get("is_object", False)
        self.system["tags"] = self.data.get("tags", [])
        self.system["summon_effects"] = self.data.get("summon_effects", "")
        self.system["summon_actions"] = self.data.get("summon_actions", "")
        self.finalize()

    def process_as_foe(self):
        self.type = "foe"
        self.raw_inherit()
        self.hydrate_traits()

        # Do initial copying
        self.system["chapter"] = self.data.get("chapter", 1)
        self.system["class"] = self.data.get("class", "Unknown")
        self.system["faction"] = self.data.get("faction", "Unknown")
        self.system["vitality"] = self.data.get("vitality", 4)
        self.system["speed"] = self.data.get("speed", 4)
        self.system["defense"] = self.data.get("defense", 4)
        self.system["fray_damage"] = self.data.get("fray_damage", 1)
        self.system["damage_die"] = self.data.get("damage_die", 6)
        self.actions.extend(mandate_list(self.data.get("actions")))

        self.process_setup_info()
        self.process_conditional_abilities()

        # Finally, convert our actions & traits
        for action in self.actions:
            self.process_action(action)

        for trait in self.traits:
            self.process_trait(trait)

        self.finalize()

    def process_action(self, data):
        """
        Uses an ItemProcessor to process the given item as an action
        """
        ip = ItemProcessor(self, data)
        ip.process_as_action()

    def process_trait(self, data):
        """
        Uses an ItemProcessor to process the given item as an trait
        """
        ip = ItemProcessor(self, data)
        ip.process_as_trait()

    def finalize(self):
        """
        Create the actual document model and write it to a file
        """
        actor = {
            "name": self.name,
            "type": self.type,
            "_id": self.id,
            "system": self.system,
            "img": "icons/svg/mystery-man.svg",
            "items": self.item_ids,
            "effects": [],
            "folder": None,
            "sort": 0,
            "ownership": {"default": 0},
            "flags": {},
            "_stats": {
                "systemId": "icon",
                "systemVersion": "0.0.0",
                "coreVersion": "11.306",
                "createdTime": 1690238921300,
                "modifiedTime": 1690238921300,
                "lastModifiedBy": "pTpVgni8yGIuH7km",
            },
            "_key": f"!actors!{self.id}",
        }

        # Dump to appropriate file
        filename = f"{self.name}_{self.id}.json".replace(" ", "_")
        with open(pack_root / "better-foes" / "_source" / filename, "w") as f:
            f.write(json.dumps(actor, indent=4))


class ItemProcessor:
    """
    Stateful process for ingesting items
    """

    def __init__(self, actor: ActorProcessor, data: Dict) -> None:
        self.parent = actor
        self.data = data
        self.name = data.get("name", "Unknown Action")
        self.id = random_id()
        self.type = None
        self.system = {}

    def process_as_action(self):
        # Get tag data
        self.type = "ability"
        all_tags = self.data.get("tags", [])
        ranges = []
        other_tags = []
        for tag in all_tags:
            if any(sym in tag for sym in ["range", "blast", "line", "arc", "burst"]):
                ranges.append(tag)
            else:
                other_tags.append(tag)

        # Siphon effects. Do it via entries rather than via keys so we preserve order
        effects = []
        for k, v in self.data.items():
            if k == "hit":
                effects.append(f"Hit: {v}")
            if k == "auto_hit":
                effects.append(f"Auto Hit: {v}")
            if k == "miss":
                effects.append(f"Miss: {v}")
            if k == "area_effect":
                effects.append(f"Area: {v}")
            if k == "effects":
                sub = mandate_list(v)
                effects.extend([f"Effect: {e}" for e in sub])
            if k == "description":
                effects.append(f"Effect: {v}")
            if k == "exceed":
                effects.append(f"Exceed: {v}")
            if k == "charge":
                effects.append(f"Charge: {v}")

        # Subprocess interrupts
        for interrupt in mandate_list(self.data.get("interrupts")):
            interrupt["name"] += " (int)"
            self.data.setdefault("sub_ability", []).append(interrupt["name"])
            self.parent.process_action(interrupt)

        # Subprocess combos
        if self.data.get("combo"):
            self.data["combo"]["name"] += " (combo)"
            self.data.setdefault("sub_ability", []).append(self.data["combo"]["name"])
            self.parent.process_action(self.data["combo"])

        # Subprocess summons
        self.system["summons"] = []
        for summon in mandate_list(self.data.get("summons")):
            summon["name"] += " " + CHPT[self.data.get("chapter", 1)]
            summon = self.parent.parent.process_summon(summon)
            uuid = f"Compendium.icon.better-foes.Actor.{summon.id}"
            self.system["summons"].append(uuid)


        choice = {
            "actions": self.data.get("action_cost", 0),
            "round_action": self.data.get("round_action", False),
            "tags": other_tags,
            "ranges": ranges,
            "trigger": self.data.get("trigger", ""),
            "combo": 0,
            "sub_abilities": self.data.get("sub_abilities", []),
            "resolve": 0,
            "effects": effects,
        }
        self.system["choices"] = [choice]
        self.system["chapter"] = (self.data.get("chapter", 1),)
        self.system["special_requirements"] = (
            self.data.get("special_requirements", []),
        )
        self.finalize()

    def process_as_trait(self):
        self.type = "trait"
        self.system["description"] = self.data.get("description", "Unknown")
        self.finalize()

    def finalize(self):
        """
        Create the actual document model and write it to a file
        """
        item_sort = len(self.parent.item_ids) + 1
        self.parent.item_ids.append(self.id)
        item = {
            "name": self.name,
            "type": self.type,
            "_id": self.id,
            "system": self.system,
            "img": "icons/svg/combat.svg",
            "sort": item_sort,
            "ownership": {},
            "effects": [],
            "flags": {},
            "_key": f"!actors.items!{self.parent.id}.{self.id}",
        }
        item_filename = f"{self.name}_{self.id}.json".replace(" ", "_")
        with open(pack_root / "better-foes" / "_source" / item_filename, "w") as f:
            f.write(json.dumps(item, indent=4))


def main():
    # Post process to combine conditional abilities
    p = Processor()
    p.ingest_all_raw()
    p.process()

    # Convert actions into appropriate items


main()
