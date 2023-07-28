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
            target[key] = mandate_list(target.get(key)) + mandate_list(source.get(key))

        def _sub_inherit_attr(key):
            if key in source and key not in target:
                target[key] = source[key]

        # Combine traits, actions, conditional abilities
        _sub_inherit_list("traits")
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
        if data["type"] == "Template": continue

        if index == 5:
            break

        # Decide an id
        id = random_id()
        system = {}
        items = []
        traits = []  # Later turned to items
        actions = []  # Later turned to items
        actor = {
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
        simply_inherit("name")
        simply_inherit("chapter")
        simply_inherit("class")
        simply_inherit("vitality")
        simply_inherit("speed")
        simply_inherit("defense")
        simply_inherit("fray_damage")
        simply_inherit("damage_die")
        actions = data["actions"]

        def add_item(name, type, item_system):
            item_id = random_id()
            items.append(item_id)
            item = {
                "name": name,
                "type": type,
                "_id": item_id,
                "system": item_system,
                # "img": "",
                "effects": [],
                "flags": {},
                "key": f"!actors.items!{id}.{item_id}"
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
                long_desc = f"""<br><ul>{
                    "".join(f'''
                        <li>{i['name']} - {i['description']}</li>
                            ''' for i in data.get('setup_traits'))
                }</ul>"""
            system["setup"].append({
                "name": t["name"],
                "description": t["description"] + long_desc,
            })

        # simply_inherit("setup_traits")

        # Post process to combine conditional abilities
        for cond_ability in data["conditional_abilities"]:
            # If remov traits specified, don't actually remove, but instead mark as explicitly chaptered
            for removal_target in mandate_list(cond_ability.get("remove_traits")):
                # Find the trait with the same name
                corr_trait = [x for x in traits if x["name"] == removal_target][0]
                # Mark it
                corr_trait["remove_at_chapter"] = cond_ability["chapter"]

            # Same for actions
            for removal_target in mandate_list(cond_ability.get("remove_actions")):
                # Find the trait with the same name
                corr_action = [x for x in actions if x["name"] == removal_target][0]
                # Mark it
                corr_action["remove_at_chapter"] = cond_ability["chapter"]

            # Add traits, mark similarly
            for add_target in mandate_list(cond_ability.get("traits")):
                corr_trait = lookup_trait(add_target)
                corr_trait["add_at_chapter"] = cond_ability["chapter"]
                traits.append(corr_trait)

            # Add actions, mark similarly
            for add_target in mandate_list(cond_ability.get("actions")):
                add_target["add_at_chapter"] = cond_ability["chapter"]
                actions.append(add_target)
            
        # Convert actions into appropriate items
        for i in actions:
            add_item(i["name"], "action", {

            })

        # Convert traits into appropriate items

        # Dump to appropriate file
        actor_filename = f"{name}_{id}.json".replace(" ", "_")
        with open(pack_root / "better-foes" / "_source" / actor_filename, "w") as f:
            f.write(json.dumps(actor, indent=4))


main()
