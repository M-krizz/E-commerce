# 🚀 Quick Start Guide

## Get Your Backend Running in 10 Minutes

Follow these steps to get your phishing detection system up and running with a real database and authentication.

---

## Step 1: Create Supabase Project (3 minutes)

### 1.1 Sign Up
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### 1.2 Create Project
1. Click "New project"
2. Fill in details:
   - **Name**: `phishing-detection` (or anything you like)
   - **Database Password**: Use strong password (save this!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is perfect
3. Click "Create new project"
4. ⏱️ Wait 2-3 minutes for provisioning

### 1.3 Get Your Credentials
Once ready:
1. Click ⚙️ **Settings** (bottom left)
2. Click **API** in sidebar
3. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (long string)
   - **service_role key** (even longer string - keep secret!)

**Save these somewhere safe!**

---

## Step 2: Set Up Database (2 minutes)

### 2.1 Open SQL Editor
1. In Supabase dashboard, click 🛢️ **SQL Editor** (left sidebar)
2. Click "+ New query"

### 2.2 Execute Schema
1. Open `supabase-schema.sql` in your code editor
2. Copy ALL the content (Cmd+A / Ctrl+A)
3. Paste into Supabase SQL Editor
4. Click ▶️ **Run** (or press Cmd+Enter / Ctrl+Enter)
5. You should see: ✅ "Success. No rows returned"

**What this did:**
- Created `profiles` table for users
- Created `scans` table for phishing scans
- Created `activity_logs` table for audit trail
- Set up Row-Level Security
- Created automatic triggers

---

## Step 3: Configure Environment (1 minute)

### 3.1 Create Environment File
```bash
# In your project directory
cp .env.example .env.local
```

### 3.2 Update .env.local
Open `.env.local` and update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=run-command-below-to-generate
```

### 3.3 Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` value.

**Or use the quick setup script:**
```bash
./setup.sh
```

---

## Step 4: Start Development Server (1 minute)

### 4.1 Install Dependencies (if not already done)
```bash
npm install
```

### 4.2 Start Server
```bash
npm run dev
```

### 4.3 Open App
Go to [http://localhost:3000](http://localhost:3000)

You should see the homepage! 🎉

---

## Step 5: Create Your Admin Account (3 minutes)

### 5.1 Register
1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Click "Sign up" or "Create account"
3. Enter:
   - **Email**: Your real email
   - **Password**: Strong password
4. Click "Register"

**Note**: Check your email for verification link (check spam folder!)

### 5.2 Verify Email (Optional)
If email verification is enabled:
1. Check your inbox
2. Click verification link
3. You'll be redirected back to the app

### 5.3 Make Yourself Admin
1. Go to Supabase dashboard
2. Click 🛢️ **SQL Editor**
3. Click "+ New query"
4. Paste this (replace with YOUR email):

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

5. Click ▶️ **Run**
6. You should see: "Success. 1 rows affected"

### 5.4 Verify Admin Access
1. Go back to your app
2. Refresh the page
3. You should now see "Admin" in the navigation
4. Click it - you should have access! 🎊

---

## ✅ Verification

Test everything works:

### Test Authentication
- [ ] Can register new account
- [ ] Can log in
- [ ] Can log out
- [ ] Session persists on page reload

### Test Scanning
- [ ] Go to `/scan`
- [ ] Scan a URL (try: `http://phishing-site.com`)
- [ ] Scan an email (try: "Verify your account immediately")
- [ ] Check results appear

### Test Scan History
- [ ] Go to `/logs`
- [ ] See your scan history
- [ ] Scans show correct results

### Test Admin Panel
- [ ] Go to `/admin`
- [ ] See user list (should include you)
- [ ] See statistics (users, scans, etc.)
- [ ] View activity logs

**All working?** Congratulations! 🎉

---

## 🐛 Troubleshooting

### "Invalid API key" error
```bash
# Check your .env.local file has correct values
cat .env.local

# Make sure you restart dev server after changing .env
npm run dev
```

### Can't register users
1. Check Supabase is running (green icon in dashboard)
2. Verify SQL schema was executed
3. Check browser console for errors
4. Look at Supabase logs (Dashboard → Logs)

### Login doesn't work
1. Verify user exists: Supabase → Authentication → Users
2. Clear browser cookies
3. Try incognito/private window
4. Check password is correct

### Can't access admin routes
```sql
-- Verify your role in Supabase SQL Editor
SELECT email, role FROM profiles WHERE email = 'your@email.com';

-- Should show: role = 'admin'
-- If not, run:
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Database errors
1. Verify schema was executed completely
2. Check all 3 tables exist: profiles, scans, activity_logs
3. Check RLS is enabled
4. Look at Supabase logs

---

## 📚 What's Next?

### Explore Features
- ✨ Try enabling 2FA in your profile
- 📊 Create multiple scans and watch stats update
- 👥 Create more user accounts (from incognito window)
- 🔍 Explore the admin dashboard

### Read Documentation
- 📖 [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Detailed setup
- 📡 [API_DOCS.md](./API_DOCS.md) - API reference
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production
- ✅ [CHECKLIST.md](./CHECKLIST.md) - Implementation checklist

### Deploy to Production
When you're ready:
1. Push code to GitHub
2. Deploy to Vercel (free!)
3. Update Supabase redirect URLs
4. Share your app with the world!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

---

## 🎯 Key Features You Now Have

✅ **Secure Authentication** - Real user accounts with bcrypt
✅ **Persistent Database** - All data saved in PostgreSQL  
✅ **Admin Dashboard** - Complete user management  
✅ **Activity Logging** - Full audit trail  
✅ **2FA Support** - Enterprise-grade security  
✅ **Protected Routes** - Automatic authentication  
✅ **Role-Based Access** - Users vs Admins  
✅ **API Ready** - 17 RESTful endpoints  

---

## 💡 Pro Tips

1. **Keep Supabase dashboard open** - Great for debugging
2. **Check activity_logs table** - See what's happening
3. **Use browser DevTools** - Network tab shows API calls
4. **Read error messages** - They're helpful!
5. **Supabase has great docs** - [supabase.com/docs](https://supabase.com/docs)

---

## 🆘 Need Help?

- **Setup Issues**: See [BACKEND_SETUP.md](./BACKEND_SETUP.md#troubleshooting)
- **API Questions**: See [API_DOCS.md](./API_DOCS.md)
- **Supabase Help**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Help**: [nextjs.org/docs](https://nextjs.org/docs)

---

## 🎉 Success!

You've successfully set up a production-ready backend in just 10 minutes!

**Your stack:**
- ⚡ Next.js - Modern React framework
- 🗄️ PostgreSQL - Powerful database
- 🔐 Supabase - Backend as a Service
- 🔒 Row-Level Security - Built-in protection
- 🎨 Tailwind CSS - Beautiful styling

**What you can do:**
- 👥 Manage users
- 🔍 Detect phishing
- 📊 View statistics
- 🔐 Secure authentication
- 📱 Deploy anywhere

**Next steps:**
1. Explore the features
2. Read the docs
3. Deploy to production
4. Share with the world!

---

**Built with ❤️ using Next.js + Supabase**

Need help? Check the docs or ask in Discord!
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://nextjs.org/discord
