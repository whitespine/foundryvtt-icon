#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

echo $parent_path

# Clean and gen
rm -r $parent_path/../packs/foes
mkdir -p $parent_path/../packs/foes/_source
python3 $parent_path/generate_actors.py

# Fvtt cli
fvtt package workon --type "System" icon
fvtt package pack -n "foes"
fvtt package clear