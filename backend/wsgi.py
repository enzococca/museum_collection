import os
from dotenv import load_dotenv

# Load .env file before importing app
load_dotenv()

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
