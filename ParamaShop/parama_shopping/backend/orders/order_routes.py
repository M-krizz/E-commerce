from flask import Blueprint, request
import json
import ast
import secrets
from datetime import datetime
from typing import Optional
from flask_jwt_extended import jwt_required
from database.models import Product
from database.models import db, Order
from security.encryption import encrypt_data, decrypt_data
from security.digital_signature import sign_text_base64, verify_text_base64
from security.encoding import base64_encode, base64_decode
from utils.response_handler import success, error
from logs.activity_logger import log_activity
from products.product_service import get_products_by_seller
from middleware.role_middleware import role_required

order_bp = Blueprint("order", __name__)

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

def decode_transaction_id(encoded: Optional[str]) -> Optional[str]:
    if not encoded:
        return None
    decoded = base64_decode(encoded)
    return decoded or None

def generate_transaction_id(seller_id_token: str) -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    while True:
        suffix = secrets.randbelow(10000)
        candidate = f"TXN-{seller_id_token}-{date_str}-{suffix:04d}"
        encoded = base64_encode(candidate)
        if not encoded:
            continue
        if not Order.query.filter_by(transaction_id=encoded).first():
            return candidate

def build_user_orders(user_id):
    orders = Order.query.filter_by(user_id=user_id).all()
    payload = []
    for o in orders:
        data = parse_order_data(o)
        items = data.get("items") if isinstance(data, dict) else []
        total = data.get("total") if isinstance(data, dict) else None
        integrity = None
        if o.order_signature and isinstance(data, dict):
            integrity = verify_text_base64(json.dumps(data), o.order_signature)
        transaction_id = decode_transaction_id(o.transaction_id)
        payload.append({
            "order_id": o.order_id,
            "transaction_id": transaction_id,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "items": items or [],
            "total": total,
            "integrity_valid": integrity,
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
        })
    return payload

# User: View their orders
@order_bp.route("/user-orders", methods=["GET"])
@order_bp.route("/user/orders", methods=["GET"])
@jwt_required()
@role_required("USER")
def view_user_orders(user_id):
    payload = build_user_orders(user_id)
    return success("User orders fetched", payload)

@order_bp.route("/history", methods=["GET"])
@jwt_required()
@role_required("USER")
def order_history(user_id):
    payload = build_user_orders(user_id)
    return success("Order history fetched", payload)

# Seller: View their orders
@order_bp.route("/seller-orders", methods=["GET"])
@jwt_required()
@role_required("SELLER")
def view_seller_orders(user_id):
    try:
        products = get_products_by_seller(user_id)
        product_ids = {p.product_id for p in products}

        orders = Order.query.all()
        seller_orders = []
        for o in orders:
            data = parse_order_data(o)
            if not isinstance(data, dict):
                continue
            items = data.get("items")
            if not isinstance(items, list):
                continue
            filtered = [i for i in items if isinstance(i, dict) and i.get("product_id") in product_ids]
            if not filtered:
                continue
            integrity = None
            if o.order_signature:
                integrity = verify_text_base64(json.dumps(data), o.order_signature)
            total = sum((i.get("price", 0) or 0) * (i.get("quantity", 0) or 0) for i in filtered)
            seller_orders.append({
                "order_id": o.order_id,
                "transaction_id": decode_transaction_id(o.transaction_id),
                "user_id": o.user_id,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "items": filtered,
                "total_for_seller": total,
                "integrity_valid": integrity,
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
            })

        return success("Seller orders fetched", seller_orders)
    except Exception:
        return error("Failed to load seller orders", 500)

@order_bp.route("/place", methods=["POST"])
@jwt_required()
@role_required("USER")
def place_order(user_id):
    data = request.json or {}

    items = data.get("items") or []
    if not isinstance(items, list) or len(items) == 0:
        return error("No items provided", 400)
    product_ids = [item.get("product_id") for item in items if item.get("product_id") is not None]
    seller_ids = set()
    if product_ids:
        products = Product.query.filter(Product.product_id.in_(product_ids)).all()
        product_map = {p.product_id: p for p in products}
        for item in items:
            pid = item.get("product_id")
            qty = item.get("quantity") or 0
            if pid not in product_map:
                return error("Invalid product in order", 400)
            if qty <= 0:
                return error("Invalid quantity in order", 400)
            product = product_map[pid]
            if product.stock is None or product.stock < qty:
                return error(f"Insufficient stock for product {pid}", 400)
        # apply stock deductions
        for item in items:
            pid = item.get("product_id")
            qty = item.get("quantity") or 0
            product = product_map[pid]
            product.stock -= qty
            if product.seller_id is not None:
                seller_ids.add(str(product.seller_id))
    seller_id_token = "MULTI" if len(seller_ids) > 1 else (next(iter(seller_ids), None) or "UNKNOWN")
    transaction_decoded = generate_transaction_id(seller_id_token)
    transaction_encoded = base64_encode(transaction_decoded)

    delivery = data.get("delivery") or {}
    delivery_payload = {
        "name": delivery.get("name"),
        "phone": delivery.get("phone"),
        "address_line1": delivery.get("address_line1"),
        "address_line2": delivery.get("address_line2"),
        "city": delivery.get("city"),
        "state": delivery.get("state"),
        "postal_code": delivery.get("postal_code"),
        "country": delivery.get("country"),
    }

    payload_json = json.dumps({
        "items": items,
        "total": data.get("total"),
        "timestamp": data.get("timestamp"),
        "delivery": delivery_payload,
        "transaction_id": transaction_decoded,
    })
    encrypted = encrypt_data(payload_json)
    signature = sign_text_base64(payload_json)

    order = Order(
        user_id=user_id,
        encrypted_data=encrypted,
        order_signature=signature,
        transaction_id=transaction_encoded,
        delivery_name=delivery_payload.get("name"),
        delivery_phone=delivery_payload.get("phone"),
        delivery_address_line1=delivery_payload.get("address_line1"),
        delivery_address_line2=delivery_payload.get("address_line2"),
        delivery_city=delivery_payload.get("city"),
        delivery_state=delivery_payload.get("state"),
        delivery_postal_code=delivery_payload.get("postal_code"),
        delivery_country=delivery_payload.get("country"),
    )

    db.session.add(order)
    db.session.commit()

    log_activity(user_id, "Order Placed")
    return success("Order placed successfully", {
        "transaction_id": transaction_decoded,
    })
