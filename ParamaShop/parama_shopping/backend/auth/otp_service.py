import random
from datetime import datetime, timedelta
from database.models import db, OTPVerification
from flask import current_app
from database.models import User
from flask_mail import Message
import logging

logger = logging.getLogger("otp_service")

def generate_otp():
    return str(random.randint(100000, 999999))

def save_otp(user_id):
    otp = generate_otp()
    record = OTPVerification(
        user_id=user_id,
        otp_code=otp,
        expiry_time=datetime.utcnow() + timedelta(minutes=2)
    )
    db.session.add(record)
    db.session.commit()
    # Send OTP via email
    user = User.query.get(user_id)
    if user and user.email:
        try:
            mail = current_app.mail
            msg = Message(
                subject="Your ParamaShop OTP Code",
                recipients=[user.email],
                body=ai_otp_email_content(user, otp),
            )
            mail.send(msg)
        except Exception as exc:
            logger.warning("OTP email send failed: %s", exc)
    return otp

def ai_otp_email_content(user, otp):
    # AI-generated style content
    return (
        f"Hello {user.name},\n\n"
        f"Your ParamaShop one-time code is: {otp}\n\n"
        f"Our AI security layer generated this code for your login or registration. "
        f"It expires in 5 minutes.\n\n"
        f"If you did not request this, please ignore this email or contact support.\n\n"
        f"Stay secure,\nParamaShop AI Security Team"
    )
