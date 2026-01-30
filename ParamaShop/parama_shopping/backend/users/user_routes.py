import logging
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from database.models import db, User, Order
from utils.response_handler import success, error
from logs.activity_logger import log_activity

user_bp = Blueprint("user", __name__)
logger = logging.getLogger("user_routes")

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id) if user_id else None
        if not user:
            logger.warning(f"User not found: {user_id}")
            return error("User not found")
        logger.info(f"Profile fetched for user: {user_id}")
        profile = {
            "id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role_id,
            "status": getattr(user, "status", None)
        }
        try:
            if hasattr(user, "seller_profile") and user.seller_profile:
                profile["seller_profile"] = {
                    "shop_name": user.seller_profile.shop_name,
                    "phone": user.seller_profile.phone,
                    "address": user.seller_profile.address,
                    "category": user.seller_profile.category,
                    "status": user.seller_profile.status,
                    "approved_at": user.seller_profile.approved_at.isoformat() if user.seller_profile.approved_at else None,
                }
        except Exception:
            # Seller profile table may not exist before migrations
            pass
        return success("User profile fetched", profile)
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        return error("Internal server error", 500)

@jwt_required()
def _update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.json
        user = User.query.get(user_id) if user_id else None
        if not user:
            logger.warning(f"User not found for update: {user_id}")
            return error("User not found")
        user.name = data.get("name", user.name)
        user.email = data.get("email", user.email)
        db.session.commit()
        logger.info(f"Profile updated for user: {user_id}")
        log_activity(user_id, "Profile Updated")
        return success("Profile updated", {
            "id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role_id,
            "status": getattr(user, "status", None)
        })
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        return error("Internal server error", 500)


@user_bp.route("/update", methods=["PUT"])
def update_profile():
    return _update_profile()


@user_bp.route("/profile", methods=["PUT"])
def update_profile_alias():
    return _update_profile()

@user_bp.route("/delete", methods=["DELETE"])
def delete_user():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        user = User.query.get(user_id) if user_id else User.query.first()
        if not user:
            logger.warning(f"User not found for delete: {user_id}")
            return error("User not found")
        try:
            if hasattr(user, "seller_profile") and user.seller_profile:
                db.session.delete(user.seller_profile)
                db.session.flush()
        except Exception:
            pass
        db.session.delete(user)
        db.session.commit()
        logger.info(f"User deleted: {user_id}")
        log_activity(user_id, "User Account Deleted")
        return success("User deleted")
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        return error("Internal server error", 500)

@user_bp.route("/orders", methods=["GET"])
def get_user_orders():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        user = User.query.get(user_id) if user_id else User.query.first()
        if not user:
            return error("User not found")
        user_id = user.user_id
        orders = Order.query.filter_by(user_id=user_id).all()
        logger.info(f"Orders fetched for user: {user_id}")
        return success("Orders fetched", [
            {
                "order_id": o.order_id,
                "status": o.order_status if hasattr(o, 'order_status') else None,
                "created_at": o.created_at.isoformat() if hasattr(o, "created_at") and o.created_at else None
            } for o in orders
        ])
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        return error("Internal server error", 500)
