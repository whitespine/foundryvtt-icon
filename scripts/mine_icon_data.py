import sys
import os
import shutil
import subprocess
import json
from utils.util import *

PACKS = ["abilities", "jobs", "job-traits", "relics", "bond-powers"]

# Clean and generate folders
for p in PACKS:
    try:
        shutil.rmtree(proj_root / "packs" / p)
    except FileNotFoundError:
        pass
    os.makedirs(proj_root / "packs" / p / "_source", exist_ok=True)

# Fetch raw data
subprocess.run(["fvtt", "package", "workon", "--type", "Module", "icon_data"])
for p in PACKS:
    subprocess.run(["fvtt", "package", "unpack", "-n", p])
subprocess.run(["fvtt", "package", "clear"])


# Fetch abilities
class Processor:
    def __init__(self) -> None:
        # Tracks our top level data
        self.pack = None
        self.items = []

    def ingest_all_raw(self, pack) -> None:
        """
        Ingest all raw data to our raw_traits and raw_units properties
        """
        self.pack = pack
        for path in walk_files(icon_data_pack(pack)):
            with open(path) as f:
                self.items.append(json.load(f))

    def clear(self):
        self.items = []

    def emit(self, item):
        filename = f"{item['name']}_{item['_id'][:3]}.json".replace(" ", "_")
        with open(proj_root / "packs" / self.pack / "_source" / filename , "w") as f:
            f.write(json.dumps(item, indent=4))

    def preprocess(self):
        # Handle folders
        folders = [i for i in self.items if "folder" in i["_key"]]
        items = [i for i in self.items if "folder" not in i["_key"]]

        # Emit them
        for folder in folders:
            filename = f"folder_{folder['name']}_{folder['_id'][:3]}.json".replace(" ", "_")
            with open(proj_root / "packs" / self.pack / "_source" / filename , "w") as f:
                f.write(json.dumps(folder, indent=4))
        
        # Strip some junk data from remaining items
        self.items = []
        for item in items:
            item.get("flags", {}).pop("itemacro", None)
            item.get("flags", {}).pop("worldbuilding", None)
            item.get("flags", {}).pop("core", None)
            item.get("flags", {}).pop("icon-145-data-wip", None)
            for x in [1,2,3,4,5,6]:
                item.get("flags", {}).get("icon_data", {}).pop(f"Talent{x}", None)
            item.get("system", {}).pop("quantity", None)
            item.get("system", {}).pop("weight", None)
            item.get("system", {}).pop("groups", None)
            item.pop("_stats", None)
            item.get("ownership", {}).pop("tXyJLVgERViy4mQ6", None)

            self.items.append(item)

    def remove_all_uuid_refs(self, text):
        return re.sub(r"@UUID\[.*?\]\{(.*?)\}", r"\1", text)

    def emit_abilities(self, trait):
        self.preprocess()
        for data in self.items:
            # Do processing
            data["type"] = "ability"
            name = data["name"]
            datasys = data.get("system", {})
            data["system"] = {}

            # Establish some values. SWB values code abilities one at a time
            description = self.remove_all_uuid_refs(datasys.get("description", ""));
            effects = description.replace("<p>", "").split("</p>");
            effects = [re.sub(r"<\/? *(strong|em|br) *>", "", p) for p in effects]
            dc = {
                "ranges": [],
                "tags": [],
                "description": description,
                "effects": effects
            } # Short for default choice
            data["system"]["choices"] = [dc];

            # Extract the subcomponents from the name
            parenthetical_regex = re.compile(r"\((.*?)\)")
            parts = parenthetical_regex.match(name)
            parts = parts.group(1).split(",") if parts else []
            name = parenthetical_regex.sub("", name)
            for part in parts:
                action_match = re.match(r"(\d)\s+actions?", part, re.IGNORECASE)
                if action_match:
                    dc["actions"] = int(action_match.group(1))
                    continue

                resolve_match = re.match(r"(\d)\s+resolve?", part, re.IGNORECASE)
                if resolve_match:
                    dc["resolve"] = int(resolve_match.group(1))
                    continue

                range_match = re.match(r"(Range|Arc|Line) (\d)+", part, re.IGNORECASE);
                if range_match:
                    dc["ranges"].append(range_match.group(0))
                    continue

                interrupt_match = re.match("(\d)\s+interrupt?", part, re.IGNORECASE);
                if interrupt_match:
                    dc["interrupt"] = int(interrupt_match.group(0))
                    continue

                combo_match = re.match("combo (\d)", part, re.IGNORECASE);
                if combo_match:
                    dc["combo"] = 1 if combo_match.group(1) == "1" else -1
                    continue

                # Otherwise generic tag
                dc["tags"].append(part)

            # Deduce if it's a trait
            # data["system"]["trait"] = data["flags"]["icon_data"].get("isTrait", False)
            data["system"]["trait"] = trait

            # Remove empty parens from the name & re-assign
            name = re.sub(r"\([ ,]*\)", "", name)
            name = name.strip()
            data["name"] = name

            # Extract talents
            data["system"]["talents"] = []
            data["system"]["mastery"] = None
            for talent_val in datasys["attributes"].get("Talents", {}).values():
                # talent_key tends to be something akin to Talent1
                if isinstance(talent_val, str): continue
                if "Mastery" in talent_val.get("value", ""):
                    # Time to go data mining
                    value = self.remove_all_uuid_refs(talent_val["value"])
                    trees = parse_html(value)
                    found_name = "Unnamed Mastery"
                    found_body = ""
                    if len(trees) > 0:
                        for child in trees[0].iter_children():
                            if isinstance(child, str) and "Mastery" in child:
                                found_name = child
                                break
                    if len(trees) > 1:
                        found_body = str(trees[1])

                    # Set the mastery
                    data["system"]["mastery"] = {
                        "name": found_name,
                        "text": found_body,
                    }

                elif talent_val.get("value", "").strip():
                    data["system"]["talents"].append({
                        "text": self.remove_all_uuid_refs(talent_val["value"])
                    })
                
            
            self.emit(data)
        self.clear()

    def emit_relics(self):
        self.preprocess()
        for data in self.items:
            # Do processing
            data["type"] = "relic"
            datasys = data.get("system", {})
            data["system"] = {}

            # Get meta information
            tags = datasys.get("system", {}).get("attributes", {}).get("Tags", {})
            invoke = tags.get("Invoke", {}).get("value", None)

            # Get those ranks
            talents = datasys.get("attributes", {}).get("Talents", {})
            raw_ranks = [
                datasys.get("description"),
                talents.get("Talent1", {}).get("value"),
                talents.get("Talent2", {}).get("value"),
                talents.get("Talent3", {}).get("value")
            ]
            real_ranks = []
            for rank in raw_ranks:
                if rank:
                    rank = self.remove_all_uuid_refs(rank)
                    real_ranks.append(rank)
            data["system"]["ranks"] = real_ranks

            self.emit(data)
        self.clear()

    def emit_bond_powers(self):
        self.preprocess()
        for data in self.items:
            # Do processing
            data["type"] = "bond_power"

            self.emit(data)
        self.clear()



proc = Processor()
proc.ingest_all_raw("abilities")
proc.emit_abilities(False)
proc.ingest_all_raw("job-traits")
proc.ingest_all_raw("jobs")
proc.emit_abilities(True)
proc.ingest_all_raw("relics")
proc.emit_relics()
proc.ingest_all_raw("bond-powers")
proc.emit_bond_powers()

# Fvtt cli
subprocess.run(["fvtt", "package", "workon", "--type", "System", "icon"])
for p in PACKS:
    subprocess.run(["fvtt", "package", "pack", "-n", p])
subprocess.run(["fvtt", "package", "clear"])