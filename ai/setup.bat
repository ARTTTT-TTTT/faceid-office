@echo off
echo ==== Create Virtual Environment ====
python -m venv .venv

echo ==== Activate Virtual Environment ====
call .venv\Scripts\activate

echo ==== Install Requirements ====
pip install -r requiredment.txt

echo ==== Done ====
pause
