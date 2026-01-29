from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from database.models import Log
from middleware.role_middleware import role_required

log_bp = Blueprint("logs", __name__)

@log_bp.route("/all", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def view_logs(user_id):
    logs = Log.query.order_by(Log.timestamp.desc()).all()

    return jsonify([
        {
            "user_id": log.user_id,
            "action": log.action,
            "ip": log.ip_address,
            "time": log.timestamp
        }
        for log in logs
    ])
