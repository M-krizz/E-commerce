from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required
from datetime import datetime
import json
import ast
from database.models import User, Order, Product, SellerProfile, db
from middleware.role_middleware import role_required
from security.encryption import decrypt_data
from security.digital_signature import verify_text_base64
from security.encoding import base64_decode

admin_bp = Blueprint("admin", __name__)

def _parse_order_data(order):
    if not order.encrypted_data:
        return {}
    try:
        raw = decrypt_data(order.encrypted_data)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return ast.literal_eval(raw)
    except Exception:
        return {}

# View all users
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def get_all_users(user_id):
    users = User.query.all()
    return jsonify([
        {
            "id": u.user_id,
            "name": u.name,
            "email": u.email,
            "role": u.role_id,
            "status": u.status
        }
        for u in users
    ])

# Create user (admin)
@admin_bp.route("/users", methods=["POST"])
@jwt_required()
@role_required("ADMIN")
def create_user(user_id):
    data = request.json or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    role_id = data.get("role_id", 1)
    status = data.get("status", "ACTIVE")

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    from auth.password_utils import hash_password
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role_id=role_id,
        status=status,
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created", "id": user.user_id}), 201

# Delete user (admin)
@admin_bp.route("/users/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("ADMIN")
def delete_user(user_id, id):
    user = User.query.get(id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    profile = SellerProfile.query.filter_by(user_id=user.user_id).first()
    if profile:
        db.session.delete(profile)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

# Enable / Disable user
@admin_bp.route("/user/<int:id>/toggle", methods=["PUT"])
@jwt_required()
@role_required("ADMIN")
def toggle_user(user_id, id):
    user = User.query.get(id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user.status = "DISABLED" if (user.status or "ACTIVE") == "ACTIVE" else "ACTIVE"
    db.session.commit()
    return jsonify({"message": "User status updated", "status": user.status})

# View all orders
@admin_bp.route("/orders", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def view_orders(user_id):
    orders = Order.query.all()
    return jsonify([
        {
            "order_id": o.order_id,
            "user_id": o.user_id,
            "status": getattr(o, "order_status", None),
            "transaction_id": base64_decode(o.transaction_id) if o.transaction_id else None,
            "items": (data := _parse_order_data(o)).get("items", []),
            "total": data.get("total"),
            "delivery": {
                "name": o.delivery_name,
                "phone": o.delivery_phone,
                "address_line1": o.delivery_address_line1,
                "address_line2": o.delivery_address_line2,
                "city": o.delivery_city,
                "state": o.delivery_state,
                "postal_code": o.delivery_postal_code,
                "country": o.delivery_country,
            },
            "created_at": o.created_at.isoformat() if hasattr(o, "created_at") and o.created_at else None
        }
        for o in orders
    ])

# Admin: list seller requests (pending)
@admin_bp.route("/seller-requests", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def list_seller_requests(user_id):
    pending = SellerProfile.query.filter_by(status="PENDING").all()
    return jsonify([
        {
            "user_id": p.user_id,
            "shop_name": p.shop_name,
            "phone": p.phone,
            "address": p.address,
            "category": p.category,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "user_email": p.user.email if p.user else None,
            "user_name": p.user.name if p.user else None,
        }
        for p in pending
    ])

# Admin: list approved sellers
@admin_bp.route("/sellers", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def list_sellers(user_id):
    approved = SellerProfile.query.filter_by(status="APPROVED").all()
    return jsonify([
        {
            "user_id": p.user_id,
            "shop_name": p.shop_name,
            "phone": p.phone,
            "address": p.address,
            "category": p.category,
            "status": p.status,
            "approved_at": p.approved_at.isoformat() if p.approved_at else None,
            "user_email": p.user.email if p.user else None,
            "user_name": p.user.name if p.user else None,
        }
        for p in approved
    ])

# Admin: approve seller
@admin_bp.route("/sellers/<int:id>/approve", methods=["POST"])
@jwt_required()
@role_required("ADMIN")
def approve_seller(user_id, id):
    profile = SellerProfile.query.filter_by(user_id=id).first()
    if not profile:
        return jsonify({"message": "Seller profile not found"}), 404
    profile.status = "APPROVED"
    profile.approved_at = datetime.utcnow()
    user = User.query.get(id)
    if user:
        user.role_id = 3
    db.session.commit()
    # Send email confirmation
    try:
        mail = current_app.mail
        from flask_mail import Message
        msg = Message(
            subject="ParamaShop Seller Account Approved",
            recipients=[user.email] if user and user.email else [],
            body=(
                f"Hello {user.name if user else ''},\n\n"
                "Your seller account has been approved. You can now access the Seller Dashboard.\n\n"
                "Regards,\nParamaShop Admin Team"
            ),
        )
        if msg.recipients:
            mail.send(msg)
    except Exception:
        pass
    return jsonify({"message": "Seller approved"}), 200

# Admin: reject seller
@admin_bp.route("/sellers/<int:id>/reject", methods=["POST"])
@jwt_required()
@role_required("ADMIN")
def reject_seller(user_id, id):
    profile = SellerProfile.query.filter_by(user_id=id).first()
    if not profile:
        return jsonify({"message": "Seller profile not found"}), 404
    profile.status = "REJECTED"
    db.session.commit()
    return jsonify({"message": "Seller rejected"}), 200

# Admin: delete seller
@admin_bp.route("/sellers/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("ADMIN")
def delete_seller(user_id, id):
    profile = SellerProfile.query.filter_by(user_id=id).first()
    if profile:
        db.session.delete(profile)
    user = User.query.get(id)
    if user:
        db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Seller deleted"}), 200

# Admin: list products
@admin_bp.route("/products", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def admin_products(user_id):
    products = Product.query.all()
    return jsonify([
        {
            "product_id": p.product_id,
            "name": p.product_name,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "seller_id": p.seller_id,
        }
        for p in products
    ])

# Admin: delete product
@admin_bp.route("/products/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("ADMIN")
def admin_delete_product(user_id, id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200

# Admin: revenue summary
@admin_bp.route("/revenue", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def admin_revenue(user_id):
    orders = Order.query.all()
    total = 0.0
    invalid_signatures = 0

    def parse_order_data(order):
        if not order.encrypted_data:
            return {}
        try:
            raw = decrypt_data(order.encrypted_data)
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return ast.literal_eval(raw)
        except Exception:
            return {}

    for o in orders:
        data = parse_order_data(o)
        if isinstance(data, dict):
            total += float(data.get("total") or 0)
            if o.order_signature:
                if not verify_text_base64(json.dumps(data), o.order_signature):
                    invalid_signatures += 1
    return jsonify({
        "total_revenue": total,
        "order_count": len(orders),
        "invalid_signatures": invalid_signatures
    }), 200
