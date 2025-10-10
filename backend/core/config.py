import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/taktplandb")
SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30