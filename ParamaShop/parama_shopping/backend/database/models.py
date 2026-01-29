from database.db import db
from datetime import datetime

class Role(db.Model):
    __tablename__ = "roles"
    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), unique=True)

class User(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.Text)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.role_id"))
    role = db.relationship("Role", backref="users")
    status = db.Column(db.String(20), default="ACTIVE")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SellerProfile(db.Model):
    __tablename__ = "seller_profiles"
    seller_profile_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), unique=True)
    shop_name = db.Column(db.String(150))
    phone = db.Column(db.String(30))
    address = db.Column(db.String(255))
    category = db.Column(db.String(80))
    status = db.Column(db.String(20), default="PENDING")
    approved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship("User", backref=db.backref("seller_profile", uselist=False))

class OTPVerification(db.Model):
    __tablename__ = "otp_verification"
    otp_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    otp_code = db.Column(db.String(6))
    expiry_time = db.Column(db.DateTime)
    is_verified = db.Column(db.Boolean, default=False)

class Product(db.Model):
    __tablename__ = "products"
    product_id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer)
    product_name = db.Column(db.String(150))
    description = db.Column(db.Text)
    category = db.Column(db.String(80))
    price = db.Column(db.Float)
    stock = db.Column(db.Integer)

class Order(db.Model):
    __tablename__ = "orders"
    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    encrypted_data = db.Column(db.Text)
    order_signature = db.Column(db.Text)
    transaction_id = db.Column(db.Text)
    delivery_name = db.Column(db.String(120))
    delivery_phone = db.Column(db.String(30))
    delivery_address_line1 = db.Column(db.String(255))
    delivery_address_line2 = db.Column(db.String(255))
    delivery_city = db.Column(db.String(80))
    delivery_state = db.Column(db.String(80))
    delivery_postal_code = db.Column(db.String(20))
    delivery_country = db.Column(db.String(80))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Log(db.Model):
    __tablename__ = "logs"

    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    action = db.Column(db.Text)
    ip_address = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime)
