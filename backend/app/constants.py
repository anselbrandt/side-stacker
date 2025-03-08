import os
from dotenv import load_dotenv

load_dotenv()

ENV_MODE = os.getenv("ENV_MODE", "DEV")
ROOT_PATH = os.getenv("ROOT_PATH", "")
HOST = os.getenv("HOST", "http://localhost:8000")