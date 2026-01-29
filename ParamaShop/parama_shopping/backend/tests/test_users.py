import unittest
from users.user_routes import user_bp
from flask import Flask

class UserRoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(user_bp, url_prefix="/user")
        self.client = self.app.test_client()

    def test_profile_route_exists(self):
        response = self.client.get("/user/profile")
        self.assertIn(response.status_code, [200, 401, 403, 500])

if __name__ == "__main__":
    unittest.main()
