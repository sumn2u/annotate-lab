cd client

start cmd /k "npm install && start http://localhost:5173/ && npm start"

cd ../server

IF NOT EXIST venv (
    python -m venv venv
)

start cmd /k "call venv\Scripts\activate && pip install -r requirements.txt && flask run"

pause