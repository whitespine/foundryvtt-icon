import json
import re
from dataclasses import dataclass
from typing import Dict, Optional, List
import os
import pathlib
import random
import string

# Useful path
proj_root = pathlib.Path(__file__).parent.parent
foe_root = proj_root / "IconFoeJson" / "data"
pack_root = proj_root / "packs"

random.seed(1)


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


def main():
    # Get our top level data
    raw_traits = {}
    raw_units = {}
    for path in walk_files(foe_root):
        if "traits.json" in path:
            with open(path) as f:
                for rt in json.load(f):
                    rt = recursive_downcase(rt)
                    raw_traits[rt["name"]] = rt
        else:
            with open(path) as f:
                loaded = json.load(f)
                loaded = recursive_downcase(loaded)
                raw_units[loaded["name"]] = loaded

    # Create logic for building out inherits
    def inherit_into(target, source):
        # Handle recursion first
        for super_source in mandate_list(source.get("inherits")):
            super_source = raw_units[super_source]
            inherit_into(target, super_source)

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

    # Begin building
    for index, [name, data] in enumerate(raw_units.items()):
        # Skip templates
        if data.get("type") == "Template":
            continue

        # Decide an id
        id = random_id()
        system = {
            "hp_multiplier": 4
        }
        items = []
        traits = []  # Later turned to items
        actions = []  # Later turned to items
        actor = {
            "name": name,
            "type": "foe",
            "_id": id,
            "system": system,
            "img": "icons/svg/mystery-man.svg",
            "items": items,
            "effects": [],
            "folder": None,
            "sort": index,
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
            "_key": f"!actors!{id}",
        }

        # For extremely basic metadata
        def simply_inherit(key):
            if key in data:
                system[key] = data[key]

        # Handle inheritance
        for super_source in mandate_list(data.get("inherits")):
            super_source = raw_units[super_source]
            inherit_into(data, super_source)

        # Do initial copying
        simply_inherit("chapter")
        simply_inherit("class")
        simply_inherit("vitality")
        simply_inherit("speed")
        simply_inherit("defense")
        simply_inherit("fray_damage")
        simply_inherit("damage_die")
        actions = mandate_list(data.get("actions"))

        item_sort = 0
        def add_item(name, type, item_system):
            item_id = random_id()
            item_sort += 1
            items.append(item_id)
            item = {
                "name": name,
                "type": type,
                "_id": item_id,
                "system": item_system,
                "img": "",
                "sort": item_sort,
                "ownership": {},
                "effects": [],
                "flags": {},
                "_key": f"!actors.items!{id}.{item_id}",
            }
            item_filename = f"{name}_{id}.json".replace(" ", "_")
            with open(pack_root / "better-foes" / "_source" / item_filename, "w") as f:
                f.write(json.dumps(item, indent=4))

        # Lookup a trait or substitute a default
        def lookup_trait(t):
            if t in raw_traits:
                return raw_traits[t]
            else:
                return {"name": t, "description": "No description."}

        # Then handle fetching traits
        for t in mandate_list(data.get("traits")):
            traits.append(lookup_trait(t))

        # Add setup traits, post process to combine listed descriptions into descriptions
        system["setup"] = []
        for t in mandate_list(data.get("setup_traits")):
            long_desc = ""
            if t.get("listed_items"):
                li = mandate_list(t["listed_items"])
                li = [f"<li>{i['name']} - {i['description']}</li>" for i in li]
                long_desc = f"<br><ul>{''.join(li)}</ul>"
            system["setup"].append(
                {
                    "name": t["name"],
                    "description": t["description"] + long_desc,
                }
            )

        # Post process to combine conditional abilities
        """
        special_class = "Normal"
        for cond_ability in mandate_list(data.get("conditional_abilities")):
            # Check special classes, ignore those that don't apply
            if cond_ability.get("is_special_classes", special_class) != special_class:
                continue

            # Update special classes
            if cond_ability.get("special_class"):
                special_class = cond_ability.get("special_class")
                print()
                print(json.dumps(data["conditional_abilities"], indent=2))

            # Update hp multipliers
            if cond_ability.get("h_p_multiplier"):
                system["hp_multiplier"] = cond_ability["h_p_multiplier"]

            # If remov traits specified, don't actually remove, but instead mark as explicitly chaptered
            for removal_target in mandate_list(cond_ability.get("remove_traits")):
                # Find the trait with the same name
                corr_trait = ([x for x in traits if x["name"] == removal_target])[0]
                # Mark it
                if "chapter" in cond_ability:
                    corr_trait["remove_at_chapter"] = cond_ability["chapter"]

            # Same for actions
            for removal_target in mandate_list(cond_ability.get("remove_actions")):
                # Find the trait with the same name
                corr_action = [x for x in actions if x["name"] == removal_target][0]
                # Mark it
                if "chapter" in cond_ability:
                    corr_action["remove_at_chapter"] = cond_ability["chapter"]

            # Add traits, mark similarly
            for add_target in mandate_list(cond_ability.get("traits")):
                corr_trait = lookup_trait(add_target)
                if "chapter" in cond_ability:
                    corr_trait["add_at_chapter"] = cond_ability["chapter"]
                if "is_not_special_class" in cond_ability:
                    corr_trait["is_not_special_class"] = cond_ability["is_not_special_classes"]
                traits.append(corr_trait)

            # Add actions, mark similarly
            for add_target in mandate_list(cond_ability.get("actions")):
                if "chapter" in cond_ability:
                    add_target["add_at_chapter"] = cond_ability["chapter"]
                actions.append(add_target)
        """

        # Convert actions into appropriate items
        for i in actions:
            continue
            add_item(
                i["name"],
                "ability",
                {
                    "choices": [
                        {
                            "actions": i.get("action_cost", 0),
                            "round_action": i.get("round_action", False),
                            "attack": False,
                            "true_strike": False,
                            "unerring": False,
                            "ranges": [],
                            "interrupt": 0,
                            "combo": 0,
                            "resolve": 0,
                        }
                    ]
                },
            )

        # Convert traits into appropriate items
        for t in traits:
            add_item(t["name"], "trait", {"description": t.get("description")})

        # Dump to appropriate file
        actor_filename = f"{name}_{id}.json".replace(" ", "_")
        with open(pack_root / "better-foes" / "_source" / actor_filename, "w") as f:
            f.write(json.dumps(actor, indent=4))


main()
