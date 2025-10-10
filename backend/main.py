from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import models, schemas, crud, database
from .database import engine
from .routers import auth, tasks, attachments
from .dependencies import get_current_user


limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# CORS configuration
origins = [
    "http://localhost:3000",  # Allow frontend origin
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(attachments.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Taktplan API"}

# This is a protected endpoint, just for demonstration
@app.get("/api/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# A startup event to create a default user for testing
@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=engine)
    db = database.SessionLocal()
    # Create a default manager user if it doesn't exist
    user = crud.users.get_user_by_email(db, email="manager@example.com")
    if not user:
        user_in = schemas.UserCreate(email="manager@example.com", password="password", role="manager")
        crud.users.create_user(db, user_in)

    # Create a default employee user if it doesn't exist
    user = crud.users.get_user_by_email(db, email="employee@example.com")
    if not user:
        user_in = schemas.UserCreate(email="employee@example.com", password="password", role="employee")
        crud.users.create_user(db, user_in)

    db.close()