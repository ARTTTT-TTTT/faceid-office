# ✨ Quickstart ✨

## 🛠️ Project setup 🛠️

### Install Python 3.11

- #### MacOS

```bash
brew install python@3.11
```

- #### Windows

```bash
winget install Python.Python.3.11
```

[Python download](https://www.python.org/downloads/)

##

#### (Optional) Install pipx

- #### MacOS

```bash
brew install pipx
pipx ensurepath
```

- #### Windows

```bash
python -m pip install --upgrade pipx
pipx ensurepath
```

[Pipx download](https://pipx.pypa.io/stable/installation/)

##

### Install Poetry

```bash
pipx install poetry
```

[Poetry download](https://python-poetry.org/docs/)

### ⚙️ Configure Poetry to create virtual environment in project ⚙️

```bash
poetry config virtualenvs.in-project true
```

### Install dependencies

```bash
cd ai
poetry install
```

### 🔧 Create and Set the Virtual Environment 🔧

- #### MacOS

```bash
poetry env use python3.11
```

- #### Windows

```bash
py -3.11 -c "import sys; print(sys.executable)"
```

```bash
poetry env use [full path\Python\Python311\python.exe]
```

### 🔧 Setting Up Virtual Environment in VS Code 🔧

```bash
poetry env info --path
```

`Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)

`Python: Select Interpreter`

`Enter interpreter path...`

## 🚀 Compile and run 🚀

#### 🧪 development

```bash
poetry run fastapi dev
```

#### 🚀 production

```bash
poetry run fastapi run
```

## 🧹 Format document 🧹

```bash
black .
```

## 📚 Documentation 📚

[FastAPI](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
