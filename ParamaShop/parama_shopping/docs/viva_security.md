# Parama Shopping – Viva-Ready Security Document (Detailed)

This document provides a detailed, viva-ready explanation of the security features in the Parama Shopping project.
Each feature includes: definition, purpose, exact file/function, flow, and why it matters.

---

## 1) Authentication (Verify identity)

### 1.1 Single-Factor Authentication (Email + Password)
**Purpose**
- Confirms the user is who they claim to be.

**Where used**
- Endpoint: `POST /auth/login`
- File: `parama_shopping/backend/auth/auth_routes.py`
- Function: `login()`

**Main code flow**
1. Request body contains `email` and `password`.
2. Backend queries `User` table by email.
3. Password is validated using `verify_password()`.
4. If valid, an OTP is generated and sent for second-factor verification.

**Why it matters**
- Prevents unauthorized access without valid credentials.
- Passwords are never stored as plain text.

---

### 1.2 Multi-Factor Authentication (OTP)
**Purpose**
- Adds a second layer of defense after password verification.

**Where used**
- Endpoint: `POST /auth/verify-otp`
- File: `parama_shopping/backend/auth/auth_routes.py`
- Function: `verify_otp()`
- OTP logic: `parama_shopping/backend/auth/otp_service.py`
  - `generate_otp()`
  - `save_otp()`
- OTP storage table: `OTPVerification` in `parama_shopping/backend/database/models.py`

**Main code flow**
1. After password login, `save_otp()` generates a 6-digit OTP.
2. OTP stored in `otp_verification` with expiry time (2 minutes).
3. OTP emailed to user.
4. User submits OTP to `/auth/verify-otp`.
5. Backend loads the latest non-verified OTP record.
6. OTP is compared; expiry is checked.
7. If valid, OTP is marked verified and JWT is issued.

**Why it matters**
- Prevents account takeover even if password is leaked.

---

## 2) Authorization (Role-Based Access Control)

**Purpose**
- Ensures each user can only access what their role allows.

**Where used**
- File: `parama_shopping/backend/middleware/role_middleware.py`
- Function: `role_required(required_role)`

**Role rules (typical mapping)**
- USER
- SELLER
- ADMIN

**Protected routes examples**
- `/admin/*` -> ADMIN only
- `/product/add`, `/product/my-products` -> SELLER only
- `/order/place`, `/order/history` -> USER only

**Main code flow**
1. JWT gives user_id.
2. Middleware fetches user + role.
3. If role mismatch, return 403.
4. Seller routes also check seller profile approval.

**Why it matters**
- Prevents privilege escalation.
- Protects admin and seller features from normal users.

---

## 3) Password Hashing (Protect stored credentials)

**Purpose**
- Store passwords securely so they cannot be reversed.

**Where used**
- File: `parama_shopping/backend/auth/password_utils.py`
- Functions:
  - `hash_password()`
  - `verify_password()`

**Called by**
- `/auth/register`
- `/auth/login`
- `/auth/reset-password`

**Main code flow**
1. During registration/reset, raw password is hashed.
2. Hash stored in database.
3. On login, `verify_password()` compares hash with input.

**Why it matters**
- If DB leaks, attackers cannot retrieve real passwords.

---

## 4) Encryption (Confidentiality of order data)

**Purpose**
- Protects sensitive order details from being readable in the database.

**Where used**
- File: `parama_shopping/backend/security/encryption.py`
- Used in: `parama_shopping/backend/orders/order_routes.py`
- Function: `place_order()`

**Main code flow**
1. Order details (items, totals, delivery info) are serialized to JSON.
2. `encrypt_data()` encrypts JSON using Fernet.
3. Encrypted result is stored in `orders.encrypted_data`.
4. On retrieval, `decrypt_data()` restores JSON.

**Why it matters**
- Database leaks do not expose order details.

---

## 5) Digital Signature (Integrity validation)

**Purpose**
- Detects if order data is altered after storage.

**Where used**
- File: `parama_shopping/backend/security/digital_signature.py`
- Used in: `parama_shopping/backend/orders/order_routes.py`

**Main code flow**
1. When an order is created, the JSON payload is signed via `sign_text_base64()`.
2. Signature stored in `orders.order_signature`.
3. When orders are fetched, signature is verified via `verify_text_base64()`.
4. Mismatch indicates tampering; response sets `integrity_valid = false`.

**Why it matters**
- Ensures trust that order data was not modified.

---

## 6) Key Management (Environment-based secret handling)

**Purpose**
- Prevents hardcoding sensitive keys.

**Where used**
- `.env` file -> `ENCRYPTION_KEY`
- File: `parama_shopping/backend/security/encryption.py`

**Main code flow**
1. Fernet key is loaded from environment variables.
2. Encryption/decryption uses this key.
3. Key can be rotated without code changes.

**Why it matters**
- Prevents accidental leaks in Git.
- Supports safe key rotation.

---

## 7) Encoding (Base64 for transaction IDs)

**Purpose**
- Safe storage and transport of IDs.

**Where used**
- File: `parama_shopping/backend/security/encoding.py`
- Used in: `parama_shopping/backend/orders/order_routes.py`

**Main code flow**
1. Transaction ID generated as: `TXN-SELLERID-YYYYMMDD-XXXX`.
2. ID encoded using Base64 before storing.
3. Encoded ID stored in DB; decoded value returned to user/seller/admin.

**Why it matters**
- Avoids unsafe characters and makes transport/storage safe.

---

## 8) Logging & Auditing

**Purpose**
- Records important actions for accountability.

**Where used**
- File: `parama_shopping/backend/logs/activity_logger.py`
- Used by: auth, product, order, admin, and user routes.

**Main code flow**
- `log_activity(user_id, action)` inserts records into logs table.

**Why it matters**
- Allows tracing of suspicious activity.
- Useful for audits and debugging.

---

## End-to-End Security Flow Example (Order Placement)

1. User logs in with email + password.
2. OTP is verified and JWT issued.
3. User places order with delivery details.
4. Order payload is encrypted (confidentiality).
5. Payload is signed (integrity).
6. Transaction ID encoded and stored.
7. Seller views orders:
   - Payload is decrypted.
   - Signature verified.
   - Transaction ID decoded.

---

## Viva Short Answers (Quick Lines)

- **Authentication:** `/auth/login` + `/auth/verify-otp`
- **Authorization:** `role_required()` middleware
- **Hashing:** bcrypt/werkzeug in `password_utils.py`
- **Encryption:** Fernet in `security/encryption.py`
- **Digital Signature:** SHA-256 signature in `security/digital_signature.py`
- **Encoding:** Base64 for transaction IDs
- **Key Management:** keys stored in `.env`
- **Logging:** `activity_logger.py`

---

## File Index (Exact Mapping)

- `parama_shopping/backend/auth/auth_routes.py`
- `parama_shopping/backend/auth/otp_service.py`
- `parama_shopping/backend/auth/password_utils.py`
- `parama_shopping/backend/middleware/role_middleware.py`
- `parama_shopping/backend/security/encryption.py`
- `parama_shopping/backend/security/digital_signature.py`
- `parama_shopping/backend/security/encoding.py`
- `parama_shopping/backend/orders/order_routes.py`
- `parama_shopping/backend/logs/activity_logger.py`

