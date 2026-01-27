# API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

---

## Authentication Endpoints

### Register New User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe" // optional
}
```

**Response (200):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "twoFactorEnabled": false
  },
  "session": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

---

### Logout
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User
```http
GET /api/auth/user
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "twoFactorEnabled": false
  }
}
```

**Response (401):**
```json
{
  "user": null
}
```

---

### Setup 2FA
```http
POST /api/auth/2fa
```

**Response (200):**
```json
{
  "secret": "BASE32_ENCODED_SECRET",
  "qrCode": "otpauth://totp/PhishingDetection:user@example.com?secret=..."
}
```

---

### Verify and Enable 2FA
```http
PUT /api/auth/2fa
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "message": "2FA enabled successfully"
}
```

---

### Disable 2FA
```http
DELETE /api/auth/2fa
```

**Response (200):**
```json
{
  "message": "2FA disabled successfully"
}
```

---

## Scan Endpoints

### Create New Scan
```http
POST /api/scans
```

**Request Body:**
```json
{
  "type": "url", // or "email"
  "content": "https://example.com" // or email text
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "isPhishing": true,
  "score": 75,
  "reasons": [
    "URL does not use HTTPS encryption",
    "Domain found in phishing blacklist"
  ],
  "timestamp": "2026-01-25T10:30:00.000Z"
}
```

---

### Get Scan History
```http
GET /api/scans?type=url&limit=50&offset=0
```

**Query Parameters:**
- `type` (optional): Filter by "url" or "email"
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "scans": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "url",
      "content": "https://phishing-site.com",
      "is_phishing": true,
      "score": 75,
      "reasons": ["..."],
      "created_at": "2026-01-25T10:30:00.000Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

### Get Single Scan
```http
GET /api/scans/[id]
```

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "url",
  "content": "https://example.com",
  "is_phishing": false,
  "score": 20,
  "reasons": ["URL appears legitimate"],
  "created_at": "2026-01-25T10:30:00.000Z"
}
```

---

### Delete Scan
```http
DELETE /api/scans/[id]
```

**Response (200):**
```json
{
  "message": "Scan deleted successfully"
}
```

---

## Admin Endpoints
**All admin endpoints require the user to have `role = 'admin'`**

### Get All Users
```http
GET /api/admin/users?limit=100&offset=0
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user",
      "two_factor_enabled": false,
      "created_at": "2026-01-20T10:00:00.000Z",
      "updated_at": "2026-01-25T10:30:00.000Z"
    }
  ],
  "total": 50,
  "limit": 100,
  "offset": 0
}
```

---

### Update User Role
```http
PATCH /api/admin/users/[id]
```

**Request Body:**
```json
{
  "role": "admin" // or "user"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "admin",
  "two_factor_enabled": false,
  "created_at": "2026-01-20T10:00:00.000Z",
  "updated_at": "2026-01-25T10:30:00.000Z"
}
```

---

### Delete User
```http
DELETE /api/admin/users/[id]
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Note:** Cannot delete your own admin account

---

### Get System Statistics
```http
GET /api/admin/stats
```

**Response (200):**
```json
{
  "totalUsers": 150,
  "totalScans": 5000,
  "phishingDetections": 1200,
  "urlScans": 3500,
  "emailScans": 1500,
  "recentScans": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "url",
      "is_phishing": true,
      "score": 85,
      "created_at": "2026-01-25T10:30:00.000Z",
      "profiles": {
        "email": "user@example.com"
      }
    }
  ]
}
```

---

### Get Activity Logs
```http
GET /api/admin/logs?action=user_login&limit=100&offset=0
```

**Query Parameters:**
- `action` (optional): Filter by action type
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "user_login",
      "details": {
        "email": "user@example.com"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-01-25T10:30:00.000Z",
      "profiles": {
        "email": "user@example.com"
      }
    }
  ],
  "total": 5000,
  "limit": 100,
  "offset": 0
}
```

**Common Action Types:**
- `user_registered`
- `user_login`
- `user_logout`
- `2fa_enabled`
- `2fa_disabled`
- `scan_performed`
- `user_role_updated`
- `user_deleted`

---

### Get All Scans (Admin)
```http
GET /api/admin/scans?type=url&limit=100&offset=0
```

**Query Parameters:**
- `type` (optional): Filter by "url" or "email"
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "scans": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "url",
      "content": "https://example.com",
      "is_phishing": false,
      "score": 20,
      "reasons": ["URL appears legitimate"],
      "created_at": "2026-01-25T10:30:00.000Z",
      "profiles": {
        "email": "user@example.com"
      }
    }
  ],
  "total": 5000,
  "limit": 100,
  "offset": 0
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Scan not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An error occurred during login"
}
```

---

## Authentication

All API requests (except registration and login) require authentication. The system uses HTTP-only cookies for session management.

**Session Cookie:**
- Name: `sb-access-token` and `sb-refresh-token`
- HTTP-only: Yes
- Secure: Yes (in production)
- SameSite: Lax

---

## Rate Limiting

Currently, there are no rate limits implemented. For production, consider adding:
- Login attempts: 5 per 15 minutes
- Scans: 100 per hour per user
- Admin actions: 1000 per hour

---

## Pagination

All list endpoints support pagination:
- `limit`: Number of items per page (max: 1000)
- `offset`: Starting position

**Example:**
```
/api/scans?limit=20&offset=40  // Get items 41-60
```

---

## Frontend Integration Examples

### React/Next.js Example

```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }
  
  return await response.json()
}

// Create scan
const createScan = async (type: 'url' | 'email', content: string) => {
  const response = await fetch('/api/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, content }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }
  
  return await response.json()
}

// Get scan history
const getScans = async (type?: 'url' | 'email', limit = 50, offset = 0) => {
  const params = new URLSearchParams({
    ...(type && { type }),
    limit: limit.toString(),
    offset: offset.toString(),
  })
  
  const response = await fetch(`/api/scans?${params}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }
  
  return await response.json()
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### Create Scan (requires login)
```bash
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"type":"url","content":"https://phishing-site.com"}'
```

### Get Scans (requires login)
```bash
curl http://localhost:3000/api/scans?limit=10 \
  -b cookies.txt
```

---

## Webhooks (Future Enhancement)

Not currently implemented. Potential use cases:
- Notify on high-risk phishing detection
- Send daily/weekly reports
- Integration with Slack/Teams
- Email notifications

---

## Versioning

Current version: `v1`

Future versions will be prefixed:
- `/api/v2/auth/login`
- `/api/v2/scans`

---

## Support

For issues or questions:
- Check BACKEND_SETUP.md for setup help
- Review Supabase logs for database errors
- Check browser console for client-side errors
