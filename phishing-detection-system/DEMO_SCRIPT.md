# Security Features Demo Script

## Prerequisites
1. Ensure the application is running on `http://localhost:3000`
2. Have a test user account (or register a new one)
3. Open browser developer tools to view console logs

## Demo Sequence

### 1. Authentication Demo

#### Single-Factor Authentication (SFA)
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `test123`
3. Observe the secure login process
4. Check browser network tab for encrypted session cookies

#### Multi-Factor Authentication (MFA) Setup
1. After login, navigate to `/security-settings`
2. Click "Setup TOTP"
3. Observe QR code generation
4. Use Google Authenticator app to scan QR code
5. Enter the 6-digit code to enable TOTP

#### Email OTP Verification
1. In Security Settings, click "Send Email OTP"
2. Check console for OTP (development mode)
3. Enter the OTP to verify

#### Biometric Simulation
1. Click "Simulate Biometric"
2. Observe the 1.5-second delay simulating scan
3. Note success/failure feedback

### 2. Authorization & Access Control Demo

#### Role-Based Access Control (RBAC)
1. Test access as different roles:
   - **User**: Can access `/scan` only
   - **Analyst**: Can access `/scan` and `/logs`
   - **Admin**: Can access all pages including `/admin`

2. Unauthorized Access Test:
   - Try accessing `/admin` as a non-admin user
   - Observe redirect to `/unauthorized`
   - Check security notice

### 3. Encryption Demo

#### Scan Data Encryption
1. Navigate to `/scan`
2. Enter a URL to scan (e.g., `http://example.com`)
3. Submit the scan
4. Check network tab for POST to `/api/scans`
5. Observe response includes:
   - `encrypted: true`
   - `signed: true`
   - `qrCode` with encoded report

#### Data Storage Verification
1. Open Supabase dashboard
2. Check `scans` table
3. Observe encrypted content in base64 format
4. Note the `signature` field with digital signature

### 4. Hashing & Digital Signatures Demo

#### Password Hashing
1. Register a new user
2. Check `auth.users` table in Supabase
3. Observe bcrypt hashed password

#### Digital Signature Verification
1. Perform a scan
2. Note the signature in the response
3. Verify integrity by checking signature format

### 5. Encoding Techniques Demo

#### Base64 Encoding
1. During scan, observe encrypted data is base64 encoded
2. Check console logs for encoding/decoding operations

#### QR Code Generation
1. After scan, receive QR code in response
2. Decode QR code to view scan report
3. Verify report contains scan details

#### Barcode Generation
1. Generate barcode for scan ID
2. Verify checksum validation

### 6. Security Analysis Demo

#### Threat Protection
1. **SQL Injection Protection**:
   - Try entering `' OR '1'='1` in search fields
   - Observe no SQL errors

2. **XSS Protection**:
   - Try entering `<script>alert('xss')</script>` in forms
   - Observe React sanitizes input

3. **CSRF Protection**:
   - Check cookie attributes in browser
   - Verify SameSite flag

### 7. Logging & Monitoring Demo

#### Activity Logging
1. Perform various actions (login, scan, MFA)
2. Check `activity_logs` table in Supabase
3. Observe logged events with:
   - IP addresses
   - User agents
   - Timestamps
   - Action details

### 8. Security Settings Showcase

#### Feature Toggle
1. Navigate to `/security-settings`
2. Observe all security features listed
3. Enable/disable MFA methods
4. View security status indicators

## Key Points to Highlight During Viva

### Authentication
- "We use bcrypt with 12 salt rounds for password hashing"
- "MFA includes TOTP, Email OTP, and biometric simulation"
- "Sessions are managed with secure HTTP-only cookies"

### Authorization
- "RBAC enforces access at middleware level"
- "Three roles: admin, analyst, user"
- "Unauthorized attempts are logged and blocked"

### Encryption
- "AES-256-GCM provides confidentiality and integrity"
- "RSA-2048 for secure key exchange"
- "Hybrid encryption for large datasets"

### Integrity
- "HMAC-SHA256 digital signatures prevent tampering"
- "Timing-safe comparisons prevent timing attacks"
- "All sensitive data is signed before storage"

### Encoding
- "Base64 for safe data transport"
- "QR codes for mobile-friendly reports"
- "Barcodes with checksums for quick reference"

## Common Questions & Answers

### Q: Why use AES-GCM instead of CBC?
A: GCM provides authenticated encryption, ensuring both confidentiality and integrity in one operation.

### Q: How is RBAC enforced?
A: Middleware checks user roles from database before allowing access to protected routes.

### Q: What prevents brute force attacks?
A: bcrypt's slow hashing, rate limiting, and account lockout recommendations.

### Q: How are MFA secrets protected?
A: TOTP secrets are stored encrypted in database, backup codes are hashed.

### Q: What logging is implemented?
A: All security events are logged with IP, user agent, timestamp, and action details.

## Troubleshooting

### Common Issues
1. **TOTP not working**: Ensure device time is synced
2. **Email OTP not received**: Check console for OTP in dev mode
3. **Access denied**: Verify user role in database
4. **Encryption errors**: Check encryption key storage

### Debug Commands
```bash
# Check Supabase connection
curl http://localhost:3000/api/supabase-test

# Test auth endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Success Criteria
- All authentication methods work
- Access control properly restricts resources
- Data is encrypted before storage
- Digital signatures verify integrity
- All security features are demonstrable
- System is ready for academic evaluation
