from main import create_app
from extensions import db
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = create_app()

with app.app_context():
    db.create_all()
    print("Database tables created successfully!")