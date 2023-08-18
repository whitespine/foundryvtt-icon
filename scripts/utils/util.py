import pathlib
import random
import os
import string
import re
import sys
from html.parser import HTMLParser
from dataclasses import dataclass
from typing import Optional, List, Union, Dict

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

@dataclass
class SimpleHTMLTree:
    parent: Optional["SimpleHTMLTree"]
    tag: str
    attrs: Dict[str, str]
    children: List[Union[str, "SimpleHTMLTree"]]


# Very rudimentary parses to a SimpleHTMLTree
class MyHTMLParser(HTMLParser):
    def __init__(self, *, convert_charrefs: bool = True) -> None:
        super().__init__(convert_charrefs=convert_charrefs)
        self.current_node = None
        self.roots = []
    
    def handle_starttag(self, tag, attrs):
        if self.current_node:
            oc = self.current_node
            self.current_node = SimpleHTMLTree(self.current_node, tag, attrs, [])
            oc.children.appennd(self.current_node)
        else:
            self.current_node = SimpleHTMLTree(None, tag, attrs, [])

    def handle_endtag(self, tag):
        if self.current_node:
            if self.current_node.parent is None:
                self.roots.append(self.current_node)
            self.current_node = self.current_node.parent

    def handle_data(self, data):
        self.current_node.children.append(data)
    

def parse_html(text: str) -> SimpleHTMLTree:
    parser = MyHTMLParser()
    parser.feed(text)
    return parser.roots[0]