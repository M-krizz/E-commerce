from flask import Flask, jsonify
import logging
import os
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from database.db import db

from auth.auth_routes import auth_bp
from products.product_routes import product_bp
from orders.order_routes import order_bp
from logs.log_routes import log_bp
from admin.admin_routes import admin_bp
from users.user_routes import user_bp
from security.security_routes import security_bp


def create_app():
    try:
        from dotenv import load_dotenv
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        load_dotenv(dotenv_path=env_path)
    except Exception as exc:
        logging.getLogger("app").warning("dotenv not available: %s", exc)

    from flask_mail import Mail
    from config import Config

    app = Flask(__name__)
    app.config.from_object(Config)

    # ============================
    # INIT EXTENSIONS
    # ============================
    db.init_app(app)
    Migrate(app, db)
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
    jwt = JWTManager(app)
    mail = Mail(app)
    app.mail = mail

    # ============================
    # JWT ERROR HANDLERS
    # ============================
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "error": "token_expired",
            "message": "The token has expired"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "error": "invalid_token",
            "message": "Signature verification failed"
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            "error": "authorization_required",
            "message": "Authorization token is missing"
        }), 401

    # ============================
    # REGISTER BLUEPRINTS
    # ============================
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(product_bp, url_prefix="/product")
    app.register_blueprint(order_bp, url_prefix="/order")
    app.register_blueprint(log_bp, url_prefix="/logs")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(security_bp, url_prefix="/security")

    @app.route("/", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok"}), 200

    @app.route("/favicon.ico", methods=["GET"])
    def favicon():
        return "", 204

    return app


if __name__ == "__main__":
    app = create_app()

    @app.errorhandler(404)
    def handle_not_found(e):
        return {
            "error": "Not Found",
            "message": "The requested URL was not found on the server."
        }, 404

    @app.errorhandler(Exception)
    def handle_error(e):
        return {
            "error": "Internal Server Error",
            "message": str(e)
        }, 500

    app.run(debug=True, use_reloader=False)
