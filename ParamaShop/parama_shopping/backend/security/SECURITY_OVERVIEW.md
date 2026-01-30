# Security Overview

This document explains the security features in the backend and how data moves through them.
It is written so a reader can understand the flow without opening the code.

## Quick Map (Feature -> Where -> Why)

- Authentication (email + password) -> POST /auth/login -> verify user identity
- OTP (second factor) -> POST /auth/verify-otp -> block login without OTP
- Authorization (roles) -> role_required middleware -> limit access by role
- Password hashing -> hashing.py -> prevent storing plain text passwords
- Encryption (Fernet) -> encryption.py + orders -> protect order details at rest
- Digital signature -> digital_signature.py + orders -> detect tampering
- Encoding (Base64) -> encoding.py + transaction_id -> safe storage of IDs
- Key management -> .env -> keep secrets out of source
- Logging -> activity_logger -> audit and trace actions

---

## 1) Authentication (Who the user is)

### 1.1 Email + Password (Single-Factor)
Endpoint:
- POST /auth/login

What happens:
1. User submits email and password.
2. Backend fetches the user record by email.
3. Password is verified against stored hash (bcrypt/werkzeug).
4. If correct, OTP is generated and sent for the second factor.

Why it matters:
- Prevents access with just an email.
- Password is never stored in plain text.

### 1.2 OTP (Second Factor)
Endpoint:
- POST /auth/verify-otp

Data:
- OTPs stored in OTPVerification table with expiry.

What happens:
1. OTP is generated and stored with an expiry time.
2. User submits OTP.
3. Backend verifies OTP + expiry.
4. If valid, JWT is issued.

Why it matters:
- Even if password is stolen, login still fails without OTP.

---

## 2) Authorization (What the user can do)

Roles:
- USER, SELLER, ADMIN

Enforced by:
- role_required middleware

Examples:
- /admin/* -> ADMIN only
- /product/add, /product/my-products -> SELLER only
- /order/place, /order/history -> USER only

What happens:
1. JWT identifies user and role_id.
2. role_required checks role matches the route.
3. If mismatch, request returns 403.

Why it matters:
- Prevents privilege escalation.
- Keeps admin and seller data restricted.

---

## 3) Password Hashing (Protect stored credentials)

Code:
- backend/security/hashing.py

What happens:
1. On registration, password is hashed with bcrypt/werkzeug.
2. Only the hash is stored in DB.
3. On login, input password is verified against hash.

Why it matters:
- If DB is leaked, real passwords are not exposed.

---

## 4) Encryption (Confidentiality for orders)

Code:
- backend/security/encryption.py
- backend/orders/order_routes.py

Key storage:
- ENCRYPTION_KEY in .env

What happens:
1. Order payload (items, totals, delivery info) is serialized to JSON.
2. encrypt_data() encrypts JSON using Fernet.
3. Encrypted blob saved to orders.encrypted_data.
4. decrypt_data() is used when reading back orders.

Why it matters:
- Prevents readable order data if DB is leaked.

---

## 5) Digital Signature (Integrity)

Code:
- backend/security/digital_signature.py
- backend/orders/order_routes.py

Storage:
- orders.order_signature

What happens:
1. When an order is created, the JSON payload is signed.
2. Signature stored alongside encrypted payload.
3. On read, signature is recomputed and verified.
4. If mismatch -> integrity_valid = false.

Why it matters:
- Detects tampering even if encrypted data was modified.

---

## 6) Encoding (Safe IDs with Base64)

Code:
- backend/security/encoding.py
- backend/orders/order_routes.py

Usage:
- Transaction ID generated as:
  TXN-SELLERID-YYYYMMDD-XXXX
- Stored in DB as Base64.
- Decoded value is shown to USER, SELLER, ADMIN.

Why it matters:
- Ensures ID is safe to store/transport without format issues.

---

## 7) Key Management (Env-based keys)

Keys:
- ENCRYPTION_KEY in .env

What happens:
- Keys are read from environment.
- Not hardcoded in source.
- Can be rotated without code changes.

Why it matters:
- Prevents accidental key leakage in Git.

---

## 8) Logging and Auditing

Code:
- backend/logs/activity_logger.py
- backend/logs/log_routes.py

Events logged:
- Login attempts
- OTP verification
- Product actions
- Order placement

Why it matters:
- Provides traceability for admins.
- Useful for debugging and security audits.

---

## End-to-End Flow (Order Placement)

1. USER is authenticated and has JWT.
2. USER submits order with delivery details.
3. Payload JSON is encrypted (Fernet).
4. JSON is also signed (digital signature).
5. Transaction ID is created and Base64-encoded.
6. Order is saved to DB with:
   - encrypted_data
   - order_signature
   - transaction_id (encoded)
7. Seller views order:
   - Decrypts payload
   - Verifies signature
   - Decodes transaction ID

---

## Demo Endpoints (if enabled)

- POST /security/base64-demo
  - Input: { "text": "..." }
  - Output: base64 + decoded

- POST /security/signature-demo
  - Input: { "text": "..." }
  - Output: signature + validity

- GET /security/key-info
  - Returns safe info about key usage (no secret values)

---

## File Index (Quick Reference)

- backend/auth/auth_routes.py
- backend/auth/otp_service.py
- backend/security/encryption.py
- backend/security/digital_signature.py
- backend/security/encoding.py
- backend/security/hashing.py
- backend/middleware/role_middleware.py
- backend/orders/order_routes.py
- backend/logs/activity_logger.py

