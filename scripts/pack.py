import json
import pathlib
import os
import sys
import shutil
import itertools
import subprocess
from utils.util import *

# Read our current system.json
with open(proj_root / "system.json") as f:
    system_json = json.load(f)
curr_version = system_json["version"]

if len(sys.argv) > 1:
    print(f"Releasing version {sys.argv[1]}")
    new_version = sys.argv[1]

    # Validate semver. We only accept numeric
    valid = False
    for o,n in itertools.zip_longest(curr_version.split("."), new_version.split(".")):
        if n and not o:
            # Subversion is longer
            int(n)
            valid = True
            break
        # Parse as integers
        o,n = int(o), int(n)
        if o == n:
            continue
        elif o < n:
            valid = True 
            break 
        elif o > n:
            valid = False

    # Exit early if invalid
    if not valid:
        print(f"Version {curr_version} is >= {new_version}. Cannot release")
        sys.exit(1)
    
    # Update system.json
    system_json["version"] = new_version
    system_json["download"] = f"https://github.com/whitespine/foundryvtt-icon/releases/latest/download/icon_{new_version}.zip"
    with open(proj_root / "system.json", "w") as f:
        json.dump(system_json, f, indent=2)

    # Commit
    subprocess.run(["git", "add", str(proj_root / "system.json")])
    subprocess.run(["git", "commit", "-m", f"Version bump & release {curr_version} -> {new_version}."])
    subprocess.run(["git", "push"])
else:
    print(f"Regenerating release")
    new_version = None

# Make an output zip name
output = proj_root / "releases" / f"{system_json['id']}_{system_json['version']}"

# Remove it if it exists
try:
    os.remove(output)
except FileNotFoundError:
    pass

# Make a temporary dir
tmp_dir = proj_root / "tmp_output_dir"
try:
    shutil.rmtree(tmp_dir)
except FileNotFoundError:
    pass
os.makedirs(tmp_dir)

# Perform the actual build
subprocess.run(["npm", "run", "build"])

# Build packs too
subprocess.run([proj_root / "scripts" / "gen_and_pack_foes.sh"])
# subprocess.run(["python3", proj_root / "scripts" / "mine_icon_data.py"])

# Populate it
shutil.copy(proj_root / "system.json", tmp_dir / "system.json")
shutil.copy(proj_root / "template.json", tmp_dir / "template.json")
shutil.copy(proj_root / "style.css", tmp_dir / "style.css")
shutil.copy(proj_root / "index.js", tmp_dir / "index.js")
shutil.copy(proj_root / "index.js.map", tmp_dir / "index.js.map")
shutil.copytree(proj_root / "packs", tmp_dir / "packs")
shutil.copytree(proj_root / "lang", tmp_dir / "lang")
shutil.copytree(proj_root / "Book Art", tmp_dir / "Book Art")

# Clean up detritus
for root, dirs, files in os.walk(tmp_dir / "packs"):
    for dir in dirs:
        dir = os.path.join(root, dir)
        if dir.endswith("_source"):
            shutil.rmtree(dir)

# Bundle it
os.makedirs(output.parent, exist_ok=True)
shutil.make_archive(output, 'zip', tmp_dir)

# Release it
if new_version:
    subprocess.run(["gh", "release", "create", "--generate-notes", "--latest", f"v{new_version}", str(output) + ".zip", str(proj_root / "system.json")])
    print("Released!")

# Clean up temporary dir
# shutil.rmtree(tmp_dir)
