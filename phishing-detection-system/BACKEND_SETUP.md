# Phishing Detection System - Backend Setup Guide

## 🎉 Backend Implementation Complete!

Your phishing detection system now has a fully functional backend powered by Supabase with:

- ✅ **User Authentication** - Secure login/registration with bcrypt password hashing
- ✅ **2FA Support** - Two-factor authentication using TOTP
- ✅ **Scan History** - Persistent storage of all phishing scans
- ✅ **Admin Dashboard** - User management, statistics, and activity logs
- ✅ **Row-Level Security** - Database policies to protect user data
- ✅ **Real-time Auth** - Session management with automatic token refresh

---

## 📋 Setup Instructions

### Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free tier is perfect for this project)
3. Create a new project:
   - Choose a project name (e.g., "phishing-detection")
   - Set a strong database password (save this!)
   - Select a region close to you
   - Wait 2-3 minutes for project provisioning

### Step 2: Set Up the Database

1. In your Supabase project dashboard, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` and paste it into the editor
4. Click "Run" to execute the SQL
5. You should see: "Success. No rows returned"

This will create:
- `profiles` table - User accounts and roles
- `scans` table - Phishing scan history
- `activity_logs` table - Audit trail
- Row-level security policies
- Auto-profile creation trigger

### Step 3: Configure Environment Variables

1. In Supabase dashboard, go to **Project Settings** (gear icon) → **API**
2. Find these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

3. Open `.env.local` in your project and update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=generate-a-random-32-char-string-here
```

To generate a secure JWT secret, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Configure email templates in **Authentication** → **Email Templates**

### Step 5: Create Your First Admin User

**Option A: Via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter email and password
4. After creation, go to **SQL Editor** and run:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@example.com';
```

**Option B: Via Your App**
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Sign up" and create an account
4. In Supabase SQL Editor, run the SQL above to make yourself admin

### Step 6: Test the System

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open** `http://localhost:3000`

3. **Test authentication:**
   - Try registering a new user
   - Log in with your credentials
   - Log out and log back in

4. **Test scanning:**
   - Go to `/scan`
   - Scan a URL or email
   - Check `/logs` to see your scan history

5. **Test admin features:**
   - Log in as admin
   - Go to `/admin`
   - View users, scans, and activity logs

---

## 🗂️ API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user
- `POST /api/auth/2fa` - Setup 2FA
- `PUT /api/auth/2fa` - Verify 2FA
- `DELETE /api/auth/2fa` - Disable 2FA

### Scans
- `POST /api/scans` - Create new scan
- `GET /api/scans` - Get user's scan history
- `GET /api/scans/[id]` - Get specific scan
- `DELETE /api/scans/[id]` - Delete scan

### Admin (Requires admin role)
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/[id]` - Update user role
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/logs` - Activity logs
- `GET /api/admin/scans` - All scans

---

## 🔒 Security Features

### 1. Password Security
- Passwords hashed with bcrypt (not SHA-256!)
- Automatic password strength requirements
- Secure password reset flow via Supabase

### 2. Row-Level Security (RLS)
- Users can only see their own data
- Admins can see all data
- Database enforces access control

### 3. Session Management
- HTTP-only cookies
- Automatic token refresh
- Secure session storage

### 4. Protected Routes
- Middleware checks authentication
- Admin routes require admin role
- Automatic redirect to login

### 5. Activity Logging
- All important actions logged
- IP address and user agent tracking
- Audit trail for compliance

---

## 🧪 Database Schema

### profiles
```sql
- id (uuid, primary key, references auth.users)
- email (text, unique)
- role (text, 'user' | 'admin')
- two_factor_enabled (boolean)
- two_factor_secret (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### scans
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles)
- type (text, 'url' | 'email')
- content (text)
- is_phishing (boolean)
- score (integer)
- reasons (text[])
- created_at (timestamp)
```

### activity_logs
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles)
- action (text)
- details (jsonb)
- ip_address (text, nullable)
- user_agent (text, nullable)
- created_at (timestamp)
```

---

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Important: Update Supabase URLs

After deploying, add your production URL to Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to "Site URL"
3. Add your Vercel URL to "Redirect URLs"

---

## 🐛 Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Make sure you copied the full keys from Supabase
- Restart your dev server after changing env variables

### "User not found" after signup
- Check if the `handle_new_user()` trigger was created
- Verify the SQL schema was executed completely
- Check Supabase logs for errors

### Can't access admin routes
- Verify your user has `role = 'admin'` in the database
- Check browser console for errors
- Clear cookies and log in again

### Middleware redirect loop
- Check if your `.env.local` is properly configured
- Verify Supabase URL and keys are correct
- Clear browser cookies and try again

---

## 📚 Next Steps

### Enhance Phishing Detection
- Add machine learning models
- Integrate VirusTotal API
- Add domain reputation checking
- Implement URL screenshot analysis

### Improve UI/UX
- Add loading states
- Better error messages
- Toast notifications
- Dark/light theme toggle

### Advanced Features
- Email forwarding for scans
- Browser extension
- Slack/Teams integration
- Export scan reports as PDF

---

## 💡 Tips

1. **Use Supabase Studio** - Great for debugging database issues
2. **Check Activity Logs** - Help track down authentication issues
3. **Enable RLS Policies** - Security is enabled by default, don't disable it
4. **Monitor Usage** - Free tier has limits, monitor your quotas
5. **Backup Your Data** - Export your database regularly

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Create an issue in your repo

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Dev server running successfully
- [ ] Can register new user
- [ ] Can login/logout
- [ ] Admin user created and role assigned
- [ ] Scans are saving to database
- [ ] Scan history displays correctly
- [ ] Admin dashboard accessible
- [ ] Activity logs recording actions

---

**Congratulations! Your backend is ready to use!** 🎊

The system now has production-ready authentication, persistent data storage, and admin capabilities. All mock data has been replaced with real database operations.
