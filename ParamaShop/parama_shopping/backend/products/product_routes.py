from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from database.models import db, Product
from middleware.role_middleware import role_required
from utils.response_handler import success, error
from logs.activity_logger import log_activity
from products.product_service import get_all_products

product_bp = Blueprint("product", __name__)

# View all products
@product_bp.route("/all", methods=["GET"])
def view_all_products():
    products = get_all_products()
    return success("Products fetched", [
        {
            "product_id": p.product_id,
            "name": p.product_name,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "seller_id": p.seller_id
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
    products = Product.query.filter_by(seller_id=user_id).all()
    return success("Products fetched", [
        {
            "product_id": p.product_id,
            "name": p.product_name,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "seller_id": p.seller_id
        } for p in products
    ])


@product_bp.route("/update/<int:product_id>", methods=["PUT"])
@jwt_required()
@role_required("SELLER")
def update_product(user_id, product_id):
    data = request.json or {}
    product = Product.query.get(product_id)
    if not product or product.seller_id != user_id:
        return error("Product not found", 404)
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
    product = Product.query.get(product_id)
    if not product or product.seller_id != user_id:
        return error("Product not found", 404)
    db.session.delete(product)
    db.session.commit()
    log_activity(user_id, f"Product Deleted: {product.product_name}")
    return success("Product deleted successfully")
