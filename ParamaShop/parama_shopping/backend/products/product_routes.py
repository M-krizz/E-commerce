from flask import Blueprint, request
import logging
from flask_jwt_extended import jwt_required
from database.models import db, Product, SellerProfile
from middleware.role_middleware import role_required
from utils.response_handler import success, error
from logs.activity_logger import log_activity
from products.product_service import get_all_products

product_bp = Blueprint("product", __name__)

# View all products
@product_bp.route("/all", methods=["GET"])
def view_all_products():
    products = get_all_products()
    seller_ids = {p.seller_id for p in products if p.seller_id is not None}
    seller_profiles = {}
    if seller_ids:
        seller_profiles = {
            sp.user_id: sp.shop_name
            for sp in SellerProfile.query.filter(SellerProfile.user_id.in_(seller_ids)).all()
        }
    return success("Products fetched", [
        {
            "product_id": p.product_id,
            "name": p.product_name,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "seller_id": p.seller_id,
            "shop_name": seller_profiles.get(p.seller_id)
        } for p in products
    ])

@product_bp.route("/add", methods=["POST"])
@jwt_required()
@role_required("SELLER")
def add_product(user_id):
    data = request.json

    product = Product(
        seller_id=user_id,
        product_name=data["name"],
        description=data["description"],
        category=data.get("category") or "General",
        price=data["price"],
        stock=data["stock"]
    )

    db.session.add(product)
    db.session.commit()

    log_activity(user_id, f"Product Added: {product.product_name}")
    return success("Product added successfully")


@product_bp.route("/my-products", methods=["GET"])
@jwt_required()
@role_required("SELLER")
def my_products(user_id):
    if isinstance(user_id, str) and user_id.isdigit():
        user_id = int(user_id)
    products = Product.query.filter_by(seller_id=user_id).all()
    profile = SellerProfile.query.filter_by(user_id=user_id).first()
    shop_name = profile.shop_name if profile else None
    return success("Products fetched", [
        {
            "product_id": p.product_id,
            "name": p.product_name,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "seller_id": p.seller_id,
            "shop_name": shop_name
        } for p in products
    ])


@product_bp.route("/update/<int:product_id>", methods=["PUT"])
@jwt_required()
@role_required("SELLER")
def update_product(user_id, product_id):
    if isinstance(user_id, str) and user_id.isdigit():
        user_id = int(user_id)
    data = request.json or {}
    product = Product.query.get(product_id)
    try:
        same_seller = product is not None and int(product.seller_id) == int(user_id)
    except Exception:
        same_seller = False
    if not product:
        return error("Product not found", 404)
    if not same_seller:
        logging.getLogger("product_routes").warning(
            "Seller mismatch on update. user_id=%s product_id=%s seller_id=%s",
            user_id,
            product_id,
            product.seller_id,
        )
        return error("Not allowed to update this product", 403)
    product.product_name = data.get("name", product.product_name)
    product.description = data.get("description", product.description)
    product.category = data.get("category", product.category)
    product.price = data.get("price", product.price)
    product.stock = data.get("stock", product.stock)
    db.session.commit()
    log_activity(user_id, f"Product Updated: {product.product_name}")
    return success("Product updated successfully")


@product_bp.route("/delete/<int:product_id>", methods=["DELETE"])
@jwt_required()
@role_required("SELLER")
def delete_product(user_id, product_id):
    if isinstance(user_id, str) and user_id.isdigit():
        user_id = int(user_id)
    product = Product.query.get(product_id)
    try:
        same_seller = product is not None and int(product.seller_id) == int(user_id)
    except Exception:
        same_seller = False
    if not product:
        return error("Product not found", 404)
    if not same_seller:
        logging.getLogger("product_routes").warning(
            "Seller mismatch on delete. user_id=%s product_id=%s seller_id=%s",
            user_id,
            product_id,
            product.seller_id,
        )
        return error("Not allowed to delete this product", 403)
    db.session.delete(product)
    db.session.commit()
    log_activity(user_id, f"Product Deleted: {product.product_name}")
    return success("Product deleted successfully")
