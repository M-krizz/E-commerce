import logging
import os
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

logger = logging.getLogger("digital_signature")

KEY_DIR = os.getenv("RSA_KEY_DIR", "backend/security/keys")
PRIVATE_KEY_PATH = os.path.join(KEY_DIR, "private_key.pem")
PUBLIC_KEY_PATH = os.path.join(KEY_DIR, "public_key.pem")

def load_or_generate_keys():
    if not os.path.exists(KEY_DIR):
        os.makedirs(KEY_DIR)
    private_key = None
    public_key = None
    if os.path.exists(PRIVATE_KEY_PATH) and os.path.exists(PUBLIC_KEY_PATH):
        try:
            with open(PRIVATE_KEY_PATH, "rb") as pk_file:
                private_key = serialization.load_pem_private_key(pk_file.read(), password=None)
            with open(PUBLIC_KEY_PATH, "rb") as pub_file:
                public_key = serialization.load_pem_public_key(pub_file.read())
            logger.info("RSA keys loaded from disk.")
        except Exception as e:
            logger.error(f"Error loading RSA keys: {e}")
    else:
        try:
            private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
            public_key = private_key.public_key()
            with open(PRIVATE_KEY_PATH, "wb") as pk_file:
                pk_file.write(private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            with open(PUBLIC_KEY_PATH, "wb") as pub_file:
                pub_file.write(public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                ))
            logger.info("RSA keys generated and saved to disk.")
        except Exception as e:
            logger.error(f"Error generating/saving RSA keys: {e}")
    return private_key, public_key

private_key, public_key = load_or_generate_keys()

def sign_order(order_data: str) -> bytes:
    try:
        if not private_key:
            logger.error("Private key not available for signing.")
            return b""
        signature = private_key.sign(
            order_data.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        logger.info("Order signed successfully.")
        return signature
    except Exception as e:
        logger.error(f"Error signing order: {e}")
        return b""

def verify_order_signature(order_data: str, signature: bytes) -> bool:
    try:
        if not public_key:
            logger.error("Public key not available for verification.")
            return False
        public_key.verify(
            signature,
            order_data.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        logger.info("Order signature verified successfully.")
        return True
    except InvalidSignature:
        logger.warning("Invalid signature detected.")
        return False
    except Exception as e:
        logger.error(f"Error verifying order signature: {e}")
        return False

def sign_text_base64(data: str) -> str:
    signature = sign_order(data)
    if not signature:
        return ""
    return base64.b64encode(signature).decode()

def verify_text_base64(data: str, signature_b64: str) -> bool:
    try:
        signature = base64.b64decode(signature_b64.encode())
    except Exception:
        return False
    return verify_order_signature(data, signature)

def export_public_key() -> str:
    try:
        if not public_key:
            logger.error("Public key not available for export.")
            return ""
        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        logger.info("Public key exported successfully.")
        return pem.decode()
    except Exception as e:
        logger.error(f"Error exporting public key: {e}")
        return ""
