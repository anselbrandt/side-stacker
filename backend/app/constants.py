from dotenv import load_dotenv
import base64
import os
import secrets

load_dotenv()

base64_secret = base64.standard_b64encode(secrets.token_bytes(32)).decode("utf-8")

COOKIE_EXPIRY = 86400

ENV_MODE = os.getenv("ENV_MODE", "DEV")
ROOT_PATH = os.getenv("ROOT_PATH", "")
HOST = os.getenv("HOST", "http://localhost:8000")

COOKIE_NAME = os.getenv("COOKIE_NAME", "cookie")
TOKEN_SECRET = os.getenv("TOKEN_SECRET", base64_secret)
TOKEN_ALGORITHM = "HS256"

BOARD_SIZE = 7
