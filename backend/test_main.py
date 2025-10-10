from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.main import app
from backend import schemas

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Taktplan API"}

def test_create_user():
    response = client.post(
        "/api/users/",
        json={"email": "test@example.com", "password": "testpassword", "role": "employee"},
    )
    # This endpoint does not exist yet, so we expect a 404
    assert response.status_code == 404