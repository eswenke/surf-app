# surf-app
Surf forecaster and spot ratings application.

## things to remember

### virtual env
- to create the virtual env: `python -m venv venv`
- to start the virtual env: `source venv/bin/activate` (for mac/linux) or `venv\Scripts\activate` (for windows)
    - (Windows) if script execution not enabled: open up powershell as an administrator and run `Set-ExecutionPolicy Unrestricted -Force`
- to exit the virtual env: `deactivate`

### dependencies (after starting venv)
- to install dependecies: `pip install -r requirements.txt`
- to write / update requirements file: `pip freeze > requirements.txt`
- check all python packages installed: `pip list`

### frontend
- to install dependencies for frontend: `pnpm install`
- to start frontend: `pnpm start`
- to build app for prod (NOT IN PROD YET): `pnpm build`
- to test frontend: `pnpm test`
- check all node packages installed: `pnpm list`

### backend
- Run backend with `python run.py`

