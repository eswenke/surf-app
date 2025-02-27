# surf-app
Surf forecaster and spot ratings application.

## things to remember

### virtual env
- to create the virtual env: `python -m venv venv`
- to start the virtual env: `source venv/bin/activate`
- to exit the virtual env: `deactivate`

### dependencies (after starting venv)
- to install dependecies: `pip install -r requirements.txt`
- to write / update requirements file: `pip freeze > requirements.txt`
- check all python packages installed: `pip list`

### frontend
- to install dependencies for frontend: `npm install`
- to start frontend: `npm start`
- to build app for prod (NOT IN PROD YET): `npm run build`
- to test frontend: `npm test`
- check all node packages installed: `npm list`

### backend
- to setup backend (from root): `uvicorn backend.main:app --reload`
- to setup backend (from backend folder): `uvicorn main:app --reload`

