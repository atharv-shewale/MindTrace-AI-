import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import uvicorn
from fastapi.testclient import TestClient
from main import app

def test_backend():
    client = TestClient(app)
    try:
        response = client.get("/")
        print(f"Root endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Test OPTIONS request (CORS preflight simulation)
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        }
        response = client.options("/api/auth/login", headers=headers)
        print(f"OPTIONS /api/auth/login: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")
        
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_backend()
