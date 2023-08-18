import pathlib
import random
import os
import string
import re
import sys

# Useful path
proj_root = pathlib.Path(__file__).parent.parent.parent
foe_root = proj_root / "IconFoeJson" / "data"
pack_root = proj_root / "packs"

def icon_data_pack(pack):
    if not os.environ.get("VTT_DATA"):
        print("Must provide VTT_DATA in environment")
        sys.exit(1)

    return pathlib.Path(f"{os.environ['VTT_DATA']}/modules/icon_data/packs/{pack}/_source")

random.seed(1)

# Roman numerals
CHPT = {1: "I", 2: "Ⅱ", 3: "Ⅲ"}

# Generator which walks all files in a path
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

