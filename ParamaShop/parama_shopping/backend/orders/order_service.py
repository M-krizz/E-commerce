import logging
from database.models import db, Order
from datetime import datetime

logger = logging.getLogger("order_service")

def create_order(user_id, encrypted_data):
    try:
        order = Order(
            user_id=user_id,
            encrypted_data=encrypted_data,
            created_at=datetime.utcnow()
        )
        db.session.add(order)
        db.session.commit()
        logger.info(f"Order created for user: {user_id}, order_id: {order.order_id}")
        return order
    except Exception as e:
        logger.error(f"Error creating order for user {user_id}: {e}")
        return None

def update_order_status(order_id, status):
    try:
        order = Order.query.get(order_id)
        if not order:
            logger.warning(f"Order not found for update: {order_id}")
            return None
        order.order_status = status
        db.session.commit()
        logger.info(f"Order status updated: {order_id} to {status}")
        return order
    except Exception as e:
        logger.error(f"Error updating order status for {order_id}: {e}")
        return None

def get_order_history(user_id):
    try:
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
        logger.info(f"Order history fetched for user: {user_id}")
        return orders
    except Exception as e:
        logger.error(f"Error fetching order history for user {user_id}: {e}")
        return []

def get_order_by_id(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            logger.warning(f"Order not found: {order_id}")
        return order
    except Exception as e:
        logger.error(f"Error fetching order by id {order_id}: {e}")
        return None
