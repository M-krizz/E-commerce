# ParamaShop API Documentation

## Authentication & User Management

### POST /auth/register
- Registers a new user.
- Body: { name, email, password, role_id }
- Returns: Success/Error message

### POST /auth/login
- Authenticates user and sends OTP.
- Body: { email, password }
- Returns: Success/Error message, user_id
- Rate limited

### POST /auth/verify-otp
- Verifies OTP and returns JWT token.
- Body: { user_id, otp }
- Returns: Success/Error message, token
- Rate limited

### GET /user/profile
- Returns user profile.
- Auth required

### PUT /user/update
- Updates user profile.
- Auth required
- Body: { name, email }

### DELETE /user/delete
- Deletes user account.
- Auth required

### GET /user/orders
- Returns user's order history.
- Auth required

## Product Management

### POST /product/add
- Adds a new product (seller only).
- Auth required
- Body: { name, description, price, stock }

## Order Management

### POST /order/place
- Places a new order.
- Auth required
- Body: { ...order details... }
- Order data is encrypted and digitally signed

## Admin Endpoints

### GET /admin/users
- View all users (admin only)

### PUT /admin/user/<id>/toggle
- Enable/disable user (admin only)

### GET /admin/orders
- View all orders (admin only)

## Logging

### GET /logs/all
- View all logs (admin only)

## Security Features
- Password hashing (bcrypt, SHA-256)
- JWT authentication
- OTP verification
- Role-based access control
- Rate limiting (login, OTP)
- Data encryption (orders)
- Digital signature (orders)
- Input validation
- Logging & monitoring

## Notes
- All secrets and keys are loaded from environment variables.
- RSA keys for digital signature are securely stored and loaded from disk.
- Error handling and logging are implemented for all endpoints.
- Unit tests are available for core modules.
