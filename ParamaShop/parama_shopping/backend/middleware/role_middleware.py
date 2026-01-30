from database.models import User
from flask_jwt_extended import get_jwt_identity
from utils.response_handler import error

def role_required(required_role):
    from functools import wraps
    role_map = {
        1: "USER",
        2: "ADMIN",
        3: "SELLER",
    }

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                user_id = get_jwt_identity()
                if isinstance(user_id, str) and user_id.isdigit():
                    user_id = int(user_id)

                user = User.query.get(user_id)
                if not user:
                    return error("User not found", 404)

                role_name = None
                if hasattr(user, "role") and user.role:
                    role_name = user.role.role_name
                if not role_name:
                    role_name = role_map.get(user.role_id)

                if role_name != required_role:
                    return error("Access Denied", 403)

                if required_role == "SELLER":
                    if not hasattr(user, "seller_profile") or not user.seller_profile:
                        return error("Seller profile not found", 403)
                    if user.seller_profile.status != "APPROVED":
                        return error("Seller approval pending", 403)

                return func(user_id, *args, **kwargs)
            except Exception as e:
                return error("Internal server error", 500)
        return wrapper
    return decorator
