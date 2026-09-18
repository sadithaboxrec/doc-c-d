from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Task Manager API is running"



# def test_register():
#     response = client.post(
#         "/auth/register",
#         json={
#             "name": "Test User",
#             "email": "test@example.com",
#             "password": "password123"
#         }
#     )

#     assert response.status_code == 200
#     assert response.json()["email"] == "test@example.com"