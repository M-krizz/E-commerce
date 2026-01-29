import base64
import binascii
import logging

logger = logging.getLogger("encoding_utils")

def base64_encode(data: str) -> str:
    try:
        encoded = base64.b64encode(data.encode()).decode()
        logger.info("Base64 encoding successful.")
        return encoded
    except Exception as e:
        logger.error(f"Error in base64_encode: {e}")
        return ""

def base64_decode(data: str) -> str:
    try:
        decoded = base64.b64decode(data.encode()).decode()
        logger.info("Base64 decoding successful.")
        return decoded
    except Exception as e:
        logger.error(f"Error in base64_decode: {e}")
        return ""

def hex_encode(data: str) -> str:
    try:
        encoded = binascii.hexlify(data.encode()).decode()
        logger.info("Hex encoding successful.")
        return encoded
    except Exception as e:
        logger.error(f"Error in hex_encode: {e}")
        return ""

def hex_decode(data: str) -> str:
    try:
        decoded = binascii.unhexlify(data.encode()).decode()
        logger.info("Hex decoding successful.")
        return decoded
    except Exception as e:
        logger.error(f"Error in hex_decode: {e}")
        return ""

def urlsafe_base64_encode(data: str) -> str:
    try:
        encoded = base64.urlsafe_b64encode(data.encode()).decode()
        logger.info("URL-safe Base64 encoding successful.")
        return encoded
    except Exception as e:
        logger.error(f"Error in urlsafe_base64_encode: {e}")
        return ""

def urlsafe_base64_decode(data: str) -> str:
    try:
        decoded = base64.urlsafe_b64decode(data.encode()).decode()
        logger.info("URL-safe Base64 decoding successful.")
        return decoded
    except Exception as e:
        logger.error(f"Error in urlsafe_base64_decode: {e}")
        return ""
