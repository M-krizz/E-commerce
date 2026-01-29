from flask import Blueprint, request, jsonify
import os
from security.encoding import base64_encode, base64_decode
from security.digital_signature import sign_text_base64, verify_text_base64, export_public_key

security_bp = Blueprint("security", __name__)

@security_bp.route("/base64-demo", methods=["POST"])
def base64_demo():
    data = request.json or {}
    text = data.get("text", "")
    encoded = base64_encode(text)
    decoded = base64_decode(encoded) if encoded else ""
    return jsonify({
        "input": text,
        "base64": encoded,
        "decoded": decoded
    }), 200

@security_bp.route("/signature-demo", methods=["POST"])
def signature_demo():
    data = request.json or {}
    text = data.get("text", "")
    signature = sign_text_base64(text)
    verified = verify_text_base64(text, signature) if signature else False
    return jsonify({
        "input": text,
        "signature_base64": signature,
        "verified": verified
    }), 200

@security_bp.route("/key-info", methods=["GET"])
def key_info():
    has_fernet_key = bool(os.getenv("ENCRYPTION_KEY"))
    return jsonify({
        "fernet_key_source": "ENV",
        "fernet_key_configured": has_fernet_key,
        "rsa_public_key_pem": export_public_key()
    }), 200
