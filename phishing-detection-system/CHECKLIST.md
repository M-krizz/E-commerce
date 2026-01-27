# Implementation Checklist

Use this checklist to track your backend implementation progress.

## ✅ Initial Setup

- [x] Install dependencies (`@supabase/supabase-js`, `@supabase/ssr`, `bcryptjs`)
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new Supabase project
- [ ] Save database password securely
- [ ] Copy `.env.example` to `.env.local`
- [ ] Get Supabase URL and API keys
- [ ] Update `.env.local` with Supabase credentials
- [ ] Generate and set JWT_SECRET

## ✅ Database Setup

- [ ] Open Supabase SQL Editor
- [ ] Execute `supabase-schema.sql`
- [ ] Verify tables created (profiles, scans, activity_logs)
- [ ] Check RLS policies are enabled
- [ ] Verify trigger `on_auth_user_created` exists
- [ ] Test database connection

## ✅ Authentication Configuration

- [ ] Enable Email auth in Supabase
- [ ] Configure email templates (optional)
- [ ] Test user registration
- [ ] Test user login
- [ ] Test user logout
- [ ] Verify session persistence
- [ ] Test password reset (optional)

## ✅ Admin Setup

- [ ] Create first user account
- [ ] Update user role to 'admin' in database
- [ ] Test admin login
- [ ] Verify admin routes accessible
- [ ] Verify non-admin users blocked from admin routes

## ✅ API Testing

### Authentication APIs
- [ ] POST /api/auth/register - Register new user
- [ ] POST /api/auth/login - Login existing user
- [ ] POST /api/auth/logout - Logout user
- [ ] GET /api/auth/user - Get current user
- [ ] POST /api/auth/2fa - Setup 2FA
- [ ] PUT /api/auth/2fa - Verify 2FA
- [ ] DELETE /api/auth/2fa - Disable 2FA

### Scan APIs
- [ ] POST /api/scans - Create URL scan
- [ ] POST /api/scans - Create email scan
- [ ] GET /api/scans - Get scan history
- [ ] GET /api/scans?type=url - Filter by type
- [ ] GET /api/scans/[id] - Get specific scan
- [ ] DELETE /api/scans/[id] - Delete scan

### Admin APIs
- [ ] GET /api/admin/users - List all users
- [ ] PATCH /api/admin/users/[id] - Update user role
- [ ] DELETE /api/admin/users/[id] - Delete user
- [ ] GET /api/admin/stats - Get statistics
- [ ] GET /api/admin/logs - Get activity logs
- [ ] GET /api/admin/scans - Get all scans

## ✅ Frontend Integration

- [ ] AuthProvider wrapping app in layout.tsx
- [ ] Login page using real authentication
- [ ] Register page working
- [ ] Logout functionality
- [ ] Protected routes (scan, logs, admin)
- [ ] Scan page saving to database
- [ ] Logs page showing real data
- [ ] Admin page displaying users
- [ ] Admin page showing stats
- [ ] Admin page showing activity logs

## ✅ Security Testing

- [ ] Passwords are hashed with bcrypt
- [ ] Sessions use HTTP-only cookies
- [ ] Protected routes require authentication
- [ ] Admin routes require admin role
- [ ] RLS policies prevent unauthorized access
- [ ] User can only see own scans
- [ ] Admin can see all scans
- [ ] Activity logs recording actions
- [ ] IP addresses being logged

## ✅ 2FA Testing

- [ ] User can enable 2FA
- [ ] QR code displays correctly
- [ ] Authenticator app can scan QR code
- [ ] 6-digit code verification works
- [ ] 2FA status saved in database
- [ ] User can disable 2FA
- [ ] 2FA activity logged

## ✅ Data Verification

- [ ] New users appear in profiles table
- [ ] Scans appear in scans table
- [ ] Activity appears in activity_logs table
- [ ] User email matches in database
- [ ] Scan results correctly stored
- [ ] Timestamps are accurate
- [ ] Relations between tables work

## ✅ Error Handling

- [ ] Invalid credentials show error
- [ ] Missing fields show validation errors
- [ ] Unauthorized access returns 401
- [ ] Forbidden access returns 403
- [ ] Not found returns 404
- [ ] Server errors return 500
- [ ] Error messages are user-friendly
- [ ] Errors logged in console

## ✅ Performance

- [ ] Database queries are optimized
- [ ] Indexes created on frequently queried columns
- [ ] Pagination implemented for lists
- [ ] Large datasets load quickly
- [ ] No N+1 query problems
- [ ] Supabase connection pooling enabled

## ✅ Documentation

- [x] BACKEND_SETUP.md created
- [x] API_DOCS.md created
- [x] DEPLOYMENT.md created
- [x] README.md updated
- [x] Environment variables documented
- [x] SQL schema documented

## ✅ Development Workflow

- [ ] Can run `npm run dev` successfully
- [ ] Hot reload works
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Linting passes

## ✅ Deployment Preparation

- [ ] Environment variables ready for production
- [ ] Supabase project ready for production
- [ ] Build succeeds (`npm run build`)
- [ ] Production build tested locally
- [ ] Git repository up to date
- [ ] .env.local in .gitignore
- [ ] Deployment platform chosen

## ✅ Production Deployment

- [ ] App deployed to hosting platform
- [ ] Environment variables set in platform
- [ ] Supabase redirect URLs updated
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled
- [ ] App accessible at production URL
- [ ] All features working in production

## ✅ Post-Deployment

- [ ] Create production admin user
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test scanning functionality
- [ ] Test admin capabilities
- [ ] Monitor error logs
- [ ] Check Supabase metrics
- [ ] Set up monitoring/alerts (optional)

## ✅ Optional Enhancements

- [ ] Email verification enabled
- [ ] Password reset implemented
- [ ] Rate limiting added
- [ ] Error tracking (Sentry) integrated
- [ ] Analytics dashboard
- [ ] Export scan results
- [ ] Email notifications
- [ ] Slack/Teams integration
- [ ] API documentation UI (Swagger)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

## Quick Commands Reference

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

### Supabase
```bash
supabase login              # Login to Supabase CLI
supabase init               # Initialize local Supabase
supabase start              # Start local Supabase
supabase db dump            # Export database
supabase gen types          # Generate TypeScript types
```

### Git
```bash
git add .
git commit -m "Implement backend"
git push
```

### Database Queries (via Supabase SQL Editor)
```sql
-- Make user admin
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';

-- View all users
SELECT * FROM profiles;

-- View recent scans
SELECT * FROM scans ORDER BY created_at DESC LIMIT 10;

-- View activity logs
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 20;

-- Get user scan count
SELECT user_id, COUNT(*) FROM scans GROUP BY user_id;

-- Get phishing detection rate
SELECT 
  COUNT(*) FILTER (WHERE is_phishing = true) * 100.0 / COUNT(*) as detection_rate
FROM scans;
```

---

## Troubleshooting Checklist

### If login doesn't work:
- [ ] Check Supabase URL in .env.local
- [ ] Verify API keys are correct
- [ ] Check browser console for errors
- [ ] Verify user exists in auth.users table
- [ ] Check profiles table has matching user
- [ ] Clear browser cookies and try again

### If scans don't save:
- [ ] Verify user is authenticated
- [ ] Check RLS policies are correct
- [ ] Verify scans table exists
- [ ] Check browser network tab for errors
- [ ] Look at Supabase logs

### If admin routes are blocked:
- [ ] Verify user has role = 'admin'
- [ ] Check middleware is configured
- [ ] Clear cookies and login again
- [ ] Check browser console for errors

### If 2FA doesn't work:
- [ ] Verify speakeasy is installed
- [ ] Check profiles table has two_factor_secret column
- [ ] Ensure time is synchronized on device
- [ ] Try different authenticator app

---

## Support Resources

- **Supabase Discord**: https://discord.supabase.com
- **Next.js Discord**: https://nextjs.org/discord
- **Stack Overflow**: Tag with `supabase`, `nextjs`, `typescript`

---

**Status**: [  ] Not Started  |  [ ✓ ] Complete

Track your progress by checking off items as you complete them!
