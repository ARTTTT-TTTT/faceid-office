# Quickstart

## Project setup

### Install Python 3.11

#### MacOS

```bash
brew install python@3.11
```

#### Windows

[Python download](https://www.python.org/downloads/)

### Install Poetry

```bash
pipx install poetry
```

[Poetry download](https://python-poetry.org/docs/)

### Install dependencies

```bash
poetry install
```

### Create and Set the Virtual Environment

```bash
poetry env use python3.11
```

### Setting Up Virtual Environment in VS Code

```bash
poetry env info  --path
```

`Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)

`Python: Select Interpreter`

`Enter interpreter path...`

## Compile and run

#### development

```bash
poetry run fastapi dev api.py
```
