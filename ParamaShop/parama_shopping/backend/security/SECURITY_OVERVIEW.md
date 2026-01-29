# Security Module Usage Notes

## 1) Key Exchange / Fernet Key (env-based)
- The encryption key is stored in `.env` as `ENCRYPTION_KEY`.
- `backend/security/encryption.py` loads it at runtime.
- This lets you rotate keys without changing code.

Where used:
- Order payloads are encrypted before storage in `orders.encrypted_data`.
- Decryption is used when orders are read back.

## 2) Digital Signature (Data Integrity)
- `backend/security/digital_signature.py` generates RSA keys and signs order payloads.
- Signature is stored in `orders.order_signature`.
- When orders are read, the signature is verified.

Where used:
- `POST /order/place` signs the order JSON before storing.
- `GET /user/orders`, `GET /order/user-orders`, and `GET /order/seller-orders` verify integrity and return `integrity_valid`.
- `GET /admin/revenue` counts invalid signatures.

## 3) Base64 Encoding Demo
- `backend/security/encoding.py` provides Base64 helpers.
- `POST /security/base64-demo` accepts `{ "text": "..." }` and returns Base64 + decoded text.

Where used:
- Demo endpoint for viva explanation of safe transport encoding.
  
## Demo Endpoints
- `POST /security/base64-demo`
- `POST /security/signature-demo`
- `GET /security/key-info`
