from flask import Blueprint, request
import os
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from datetime import datetime, timedelta

from database.models import db, User, OTPVerification, SellerProfile
from utils.response_handler import success, error
from logs.activity_logger import log_activity
from auth.password_utils import hash_password, verify_password
from auth.otp_service import save_otp

auth_bp = Blueprint("auth", __name__)


# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password")

    if not name or not email or not password:
        return error("All fields are required")

    if User.query.filter_by(email=email).first():
        return error("Email already registered")

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role_id=1  # USER
    )

    db.session.add(user)
    db.session.commit()

    save_otp(user.user_id)
    log_activity(user.user_id, "User Registered")

    return success("Registration successful. OTP sent.", {
        "user_id": user.user_id
    })


# =========================
# REGISTER SELLER
# =========================
@auth_bp.route("/register-seller", methods=["POST"])
def register_seller():
    data = request.json or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password")
    shop_name = data.get("shop_name", "").strip()
    phone = data.get("phone", "").strip()
    address = data.get("address", "").strip()
    category = data.get("category", "").strip()

    if not name or not email or not password:
        return error("Name, email, and password are required")
    if not shop_name or not phone or not address or not category:
        return error("Shop name, phone, address, and category are required")

    if User.query.filter_by(email=email).first():
        return error("Email already registered")

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role_id=1  # USER until admin approval
    )

    db.session.add(user)
    db.session.commit()

    profile = SellerProfile(
        user_id=user.user_id,
        shop_name=shop_name,
        phone=phone,
        address=address,
        category=category,
        status="PENDING",
    )
    db.session.add(profile)
    db.session.commit()

    save_otp(user.user_id)
    log_activity(user.user_id, "Seller Registered")

    return success("Seller registration successful. OTP sent.", {
        "user_id": user.user_id
    })


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return error("Email and password required")

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(user.password_hash, password):
        return error("Invalid email or password")

    save_otp(user.user_id)
    log_activity(user.user_id, "Login OTP Sent")

    return success("OTP sent", {"user_id": user.user_id})


# =========================
# VERIFY OTP (NO JWT HERE)
# =========================
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json or {}

    user_id = data.get("user_id")
    otp = data.get("otp")

    if not user_id or not otp:
        return error("User ID and OTP required")

    if os.environ.get("OTP_BYPASS", "false").lower() == "true":
        token = create_access_token(identity=user_id)
        log_activity(user_id, "OTP Bypassed")
        return success("OTP bypassed", {"token": token})

    otp_record = (
        OTPVerification.query
        .filter_by(user_id=user_id, is_verified=False)
        .order_by(OTPVerification.expiry_time.desc())
        .first()
    )

    if not otp_record or otp_record.otp_code != otp:
        return error("Invalid OTP")

    if otp_record.expiry_time < datetime.utcnow():
        return error("OTP expired")

    otp_record.is_verified = True
    db.session.commit()

    token = create_access_token(identity=user_id)
    log_activity(user_id, "OTP Verified")

    return success("OTP verified", {
        "token": token
    })


# =========================
# FORGOT PASSWORD
# =========================
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return error("Email required")

    user = User.query.filter_by(email=email).first()
    if user:
        save_otp(user.user_id)

    return success("If email exists, OTP has been sent")


# =========================
# VERIFY RESET OTP
# =========================
@auth_bp.route("/verify-reset-otp", methods=["POST"])
def verify_reset_otp():
    data = request.json or {}

    email = data.get("email")
    otp = data.get("otp")

    user = User.query.filter_by(email=email).first()
    if not user:
        return error("Invalid email")

    if os.environ.get("OTP_BYPASS", "false").lower() == "true":
        return success("OTP bypassed")

    otp_record = (
        OTPVerification.query
        .filter_by(user_id=user.user_id, is_verified=False)
        .order_by(OTPVerification.expiry_time.desc())
        .first()
    )

    if not otp_record or otp_record.otp_code != otp:
        return error("Invalid OTP")

    if otp_record.expiry_time < datetime.utcnow():
        return error("OTP expired")

    otp_record.is_verified = True
    db.session.commit()

    return success("OTP verified")


# =========================
# RESET PASSWORD
# =========================
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json or {}

    email = data.get("email")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    if not email or not new_password or not confirm_password:
        return error("All fields required")

    if new_password != confirm_password:
        return error("Passwords do not match")

    user = User.query.filter_by(email=email).first()
    if not user:
        return error("Invalid email")

    user.password_hash = hash_password(new_password)
    db.session.commit()

    log_activity(user.user_id, "Password Reset")

    return success("Password reset successful")


# =========================
# TOKEN CHECK
# =========================
@auth_bp.route("/token-check", methods=["GET"])
@jwt_required()
def token_check():
    return success("Token is valid")


# =========================
# LOGOUT
# =========================
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    log_activity(user_id, "User Logged Out")
    return success("Logged out successfully")
