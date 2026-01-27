# Phishing Detection System

A production-ready, full-stack cybersecurity application for phishing detection and analysis. Built with Next.js and Supabase, featuring secure authentication, persistent data storage, and comprehensive admin capabilities.

## Features

### Authentication Module
- **Login & Registration**: Secure Supabase authentication
- **Password Hashing**: bcrypt-based password security (not SHA-256)
- **Two-Factor Authentication (2FA)**: Real TOTP-based authentication with QR codes
- **Session Management**: HTTP-only cookies with automatic token refresh
- **Email Verification**: Supabase email confirmation flow

### Authorization & Access Control
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full system access, can view all logs and user activity
  - **User**: Can only scan and view personal results

### Phishing Detection Module
- **URL Analysis**:
  - HTTPS encryption verification
  - URL length analysis
  - Domain blacklist checking
  - IP address detection
  - Subdomain analysis

- **Email Analysis**:
  - Suspicious keyword detection
  - Urgency language identification
  - Request pattern analysis
  - Generic greeting detection
  - Financial language detection

- **Risk Scoring**: Comprehensive scoring algorithm (0-100)

### Security Features Display
- **Hashing**: SHA-256 password storage explanation
- **Encryption**: AES-256 data protection concepts
- **Digital Signatures**: Hash-based integrity verification
- **Encoding**: Base64 data format transformation

### Logging & Monitoring
- **Scan History**: Detailed records of all phishing detections
- **Admin Dashboard**: System-wide activity monitoring
- **Real-time Statistics**: Detection metrics and trends

## Technology Stack

- **Framework**: Next.js (App Router)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Authentication**: Supabase Auth with Row-Level Security
- **Database**: PostgreSQL with automatic backups
- **Password Hashing**: bcryptjs
- **2FA**: speakeasy + qrcode

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── user/route.ts
│   │   │   └── 2fa/route.ts
│   │   ├── scans/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── admin/
│   │       ├── users/route.ts
│   │       ├── stats/route.ts
│   │       ├── logs/route.ts
│   │       └── scans/route.ts
│   ├── layout.tsx              # Root layout with dark theme
│   ├── globals.css             # Cybersecurity theme colors and animations
│   ├── page.tsx                # Home dashboard
│   ├── login/
│   │   └── page.tsx            # Login page with OTP verification
│   ├── scan/
│   │   └── page.tsx            # Phishing detection scanner
│   ├── logs/
│   │   └── page.tsx            # Scan history and logs
│   ├── security-info/
│   │   └── page.tsx            # Security concepts education
│   └── admin/
│       └── page.tsx            # Admin-only panel
├── components/
│   └── navbar.tsx              # Navigation component
├── lib/
│   ├── auth-context.ts         # React Context for authentication
│   ├── phishing-detection.ts   # Detection algorithms
│   ├── database.types.ts       # TypeScript types for database
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── middleware.ts       # Auth middleware
├── middleware.ts               # Next.js middleware for route protection
├── supabase-schema.sql         # Database schema
├── .env.local                  # Environment variables (create this)
├── .env.example                # Example environment file
├── BACKEND_SETUP.md            # Detailed setup guide
├── API_DOCS.md                 # Complete API documentation
├── setup.sh                    # Quick setup script
└── package.json
```

## Getting Started

### Prerequisites

1. **Node.js** 18+ installed
2. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
3. **Git** (optional, for cloning)

### Installation

**Quick Setup:**
```bash
# Run the setup script
./setup.sh
```

**Manual Setup:**

1. **Install dependencies:**
```bash
npm install
```

2. **Create Supabase project:**
  - Go to [supabase.com](https://supabase.com)
  - Create a new project
  - Wait for provisioning (2-3 minutes)

3. **Set up database:**
  - Open Supabase SQL Editor
  - Copy contents of `supabase-schema.sql`
  - Execute the SQL

4. **Configure environment:**
  - Copy `.env.example` to `.env.local`
  - Add your Supabase URL and keys
  - Generate a JWT secret

5. **Run development server:**
```bash
npm run dev
```

6. **Create admin user:**
  - Register at `/login`
  - In Supabase SQL Editor:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
  ```

📚 **For detailed instructions, see [BACKEND_SETUP.md](./BACKEND_SETUP.md)**

## API Documentation

The system provides a complete REST API. See [API_DOCS.md](./API_DOCS.md) for:
- Authentication endpoints
- Scan management
- Admin operations
- Request/response examples
- cURL examples

## Database Schema

### Tables
- **profiles** - User accounts and roles
- **scans** - Phishing detection history
- **activity_logs** - Audit trail

### Security
- Row-Level Security (RLS) enabled
- Users can only access their own data
- Admins have full access
- Automatic profile creation on signup
- Role: User

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: Administrator

## Usage

### For Regular Users

1. **Login**: Use the user credentials above
2. **OTP Verification**: Enter any 6-digit number
3. **Scan URLs**: Navigate to Scan → Check URL
4. **Scan Emails**: Navigate to Scan → Check Email
5. **View History**: Go to Logs to see all your scans
6. **Learn Security**: Visit Security Info for educational content

### For Administrators

1. **Login**: Use the admin credentials
2. **Access Admin Panel**: Click "Admin Panel" in the navbar
3. **View All Logs**: Access system-wide detection records
4. **Monitor Users**: See user statistics and activities
5. **System Status**: Check security metrics and compliance

## Security Concepts

### Hashing
- **Purpose**: Secure password storage
- **Method**: SHA-256 (one-way transformation)
- **Advantage**: Passwords cannot be reversed from hash

### Encryption
- **Purpose**: Data confidentiality and protection
- **Method**: Simulated AES-256
- **Advantage**: Data is unreadable without the encryption key

### Digital Signatures
- **Purpose**: Authentication and integrity verification
- **Method**: Hash-based cryptographic signatures
- **Advantage**: Proves authenticity and detects tampering

### Encoding
- **Purpose**: Data format transformation
- **Method**: Base64 encoding/decoding
- **Important**: Encoding ≠ Encryption (no security benefit)

## Phishing Detection Algorithms

### URL Detection Rules

| Rule | Weight | Description |
|------|--------|-------------|
| HTTPS Missing | 20 | HTTP instead of HTTPS |
| Suspicious Length | 15 | URL longer than 75 characters |
| Blacklisted Domain | 40 | Domain in known phishing list |
| IP Address Used | 35 | URL uses IP instead of domain |
| Suspicious Subdomains | 10 | Unusual subdomain structure |

### Email Detection Rules

| Rule | Weight | Description |
|------|--------|-------------|
| Suspicious Keywords | 15 each | "verify account", "confirm password", etc. |
| Urgency Language | 10 | "urgent", "immediate", "asap", etc. |
| Generic Greeting | 10 | "Dear User" instead of personalization |
| Financial Language | 15 | Payment, billing, or account urgency |
| Request for Action | 5-10 | Click links or verify information |

## Access Control Examples

### User-Level Access

```typescript
// Users can only view their own scans
if (userRole === 'user' && logEntry.userRole === 'admin') {
  // Hide from user
}

// Users cannot access admin panel
if (role !== 'admin') {
  router.push('/')
}
```

### Admin-Level Access

```typescript
// Admins can view all system logs
const allLogs = logs // No filtering

// Admins can see user statistics
const userStats = {
  totalScans: 2341,
  threatsDetected: 287,
  activeUsers: 128
}
```

## Testing the Application

### Test URL Examples

**Safe URLs:**
- `https://github.com`
- `https://www.google.com`
- `https://www.microsoft.com`

**Suspicious URLs:**
- `http://example.com` (No HTTPS)
- `http://192.168.1.1/login` (IP address)
- `https://fake-bank.net` (Blacklisted)
- `https://paypal-confirm.co` (Spoofed domain)

### Test Email Examples

**Safe Email:**
```
Thank you for signing up! Your account is active.
```

**Suspicious Email:**
```
Dear User,

Your account has suspicious activity. Click here immediately 
to verify your password and confirm your credit card details.

This urgent action is required now!
```

## Color Scheme

The application uses a cybersecurity-themed dark color palette:

- **Primary (Cyan)**: `#00d9ff` - Main accent and interactive elements
- **Success (Green)**: `#00ff88` - Safe/positive indicators
- **Warning (Orange)**: `#ffaa00` - Caution warnings
- **Danger (Pink)**: `#ff3366` - Phishing/threat indicators
- **Background**: `#0a0e27` - Dark navy base
- **Card**: `#111633` - Slightly lighter backgrounds
- **Border**: `#1a1f3a` - Subtle dividers

## Security Notes

⚠️ **Important**: This is an educational application for cybersecurity labs. It contains:

- Simulated authentication (not for production use)
- Mock cryptographic functions (for learning purposes)
- Demo credentials (only for testing)
- Simplified detection algorithms (educational level)

For production use, implement:
- bcrypt or Argon2 for password hashing
- AES-256 or similar for real encryption
- Industry-standard session management
- Machine learning for phishing detection

## Academic Use

This application is designed for:
- **Cybersecurity Courses**: Demonstrate security principles
- **Lab Evaluations**: Hands-on security concept learning
- **Awareness Training**: Phishing identification skills
- **Research Projects**: Security implementation studies

## Features Checklist

- ✅ Authentication with password hashing
- ✅ Role-based authorization (Admin/User)
- ✅ Phishing detection with rule-based scoring
- ✅ URL and email analysis
- ✅ Security concepts visualization
- ✅ Comprehensive logging system
- ✅ Admin dashboard with user management
- ✅ Responsive cybersecurity-themed UI
- ✅ OTP verification simulation
- ✅ Real-time statistics and reporting

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Educational use only. For academic and training purposes.

## Support

For issues or questions about the application, refer to the security documentation or consult your cybersecurity instructor.
