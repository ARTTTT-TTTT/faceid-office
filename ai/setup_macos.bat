#!/bin/bash

echo "==== Create Virtual Environment ===="
python3 -m venv .venv

echo "==== Activate Virtual Environment ===="
source .venv/bin/activate

echo "==== Install Requirements ===="
pip install -r requirements.txt

echo "==== Done ===="
