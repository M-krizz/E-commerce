import logging
from database.models import db, Product

logger = logging.getLogger("product_service")

def create_product(seller_id, name, description, price, stock):
    try:
        product = Product(
            seller_id=seller_id,
            product_name=name,
            description=description,
            category=None,
            price=price,
            stock=stock
        )
        db.session.add(product)
        db.session.commit()
        logger.info(f"Product created: {product.product_id} by seller {seller_id}")
        return product
    except Exception as e:
        logger.error(f"Error creating product for seller {seller_id}: {e}")
        return None

def update_product(product_id, data):
    try:
        product = Product.query.get(product_id)
        if not product:
            logger.warning(f"Product not found for update: {product_id}")
            return None
        product.product_name = data.get("name", product.product_name)
        product.description = data.get("description", product.description)
        if "category" in data:
            product.category = data.get("category")
        product.price = data.get("price", product.price)
        product.stock = data.get("stock", product.stock)
        db.session.commit()
        logger.info(f"Product updated: {product_id}")
        return product
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        return None

def delete_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            logger.warning(f"Product not found for delete: {product_id}")
            return False
        db.session.delete(product)
        db.session.commit()
        logger.info(f"Product deleted: {product_id}")
        return True
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        return False

def get_product_by_id(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            logger.warning(f"Product not found: {product_id}")
        return product
    except Exception as e:
        logger.error(f"Error fetching product by id {product_id}: {e}")
        return None

def get_products_by_seller(seller_id):
    try:
        products = Product.query.filter_by(seller_id=seller_id).all()
        logger.info(f"Products fetched for seller: {seller_id}")
        return products
    except Exception as e:
        logger.error(f"Error fetching products for seller {seller_id}: {e}")
        return []

def search_products(query):
    try:
        products = Product.query.filter(Product.product_name.ilike(f"%{query}%")).all()
        logger.info(f"Products searched with query: {query}")
        return products
    except Exception as e:
        logger.error(f"Error searching products with query {query}: {e}")
        return []

def get_all_products():
    try:
        products = Product.query.all()
        logger.info("All products fetched")
        return products
    except Exception as e:
        logger.error(f"Error fetching all products: {e}")
        return []
