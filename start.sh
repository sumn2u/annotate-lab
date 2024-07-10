#!/bin/bash
cd client

npm install
xdg-open http://localhost:5174/
npm start &


cd ../server


if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
flask run &


read -p "Press any key to continue..."
