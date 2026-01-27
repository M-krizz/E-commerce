# Deployment Guide

## 🚀 Deploying to Production

This guide covers deploying your Phishing Detection System to production using Vercel (recommended) or other hosting platforms.

---

## Vercel Deployment (Recommended)

Vercel is the easiest way to deploy Next.js applications and integrates perfectly with Supabase.

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- Supabase project already set up

### Step 1: Push to Git

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with backend"

# Add remote (GitHub example)
git remote add origin https://github.com/yourusername/phishing-detection.git

# Push
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

**Important:** Add these to ALL environments (Production, Preview, Development)

### Step 4: Deploy

Click "Deploy" and wait for the build to complete (2-5 minutes).

### Step 5: Configure Supabase URLs

After deployment, update Supabase with your production URL:

1. Go to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Update:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/**`

### Step 6: Test Production

1. Visit your Vercel URL
2. Register a new user
3. Verify email (check spam folder)
4. Test login
5. Make yourself admin in Supabase:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```

---

## Custom Domain

### Add Custom Domain to Vercel

1. Go to Vercel Project → Settings → Domains
2. Add your domain (e.g., `phishing-detector.com`)
3. Configure DNS records as shown by Vercel
4. Wait for DNS propagation (5-60 minutes)

### Update Supabase URLs

Update the Site URL and Redirect URLs in Supabase to use your custom domain.

---

## Docker Deployment (Self-Hosted)

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build
docker build -t phishing-detection .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e JWT_SECRET=your-secret \
  phishing-detection
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## AWS Amplify Deployment

### Step 1: Connect Repository

1. Go to AWS Amplify Console
2. Connect your Git repository
3. Select your branch

### Step 2: Build Settings

Use this `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Step 3: Environment Variables

Add the same environment variables as Vercel in Amplify Console.

---

## Netlify Deployment

### Step 1: Connect Repository

1. Go to Netlify
2. New site from Git
3. Connect your repository

### Step 2: Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `.next`

### Step 3: Environment Variables

Add all environment variables in Netlify site settings.

### Step 4: Next.js Runtime

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Install the plugin:
```bash
npm install -D @netlify/plugin-nextjs
```

---

## Railway Deployment

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add environment variables
5. Deploy!

Railway auto-detects Next.js and configures everything.

---

## DigitalOcean App Platform

1. Create new app on DigitalOcean
2. Connect GitHub repository
3. Configure:
   - **Type**: Web Service
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
4. Add environment variables
5. Deploy

---

## Performance Optimization

### 1. Enable Compression

Vercel and most platforms enable this by default. For self-hosted:

```javascript
// next.config.mjs
export default {
  compress: true,
  // ... other config
}
```

### 2. Image Optimization

Images are optimized by Next.js automatically. For external images, add to `next.config.mjs`:

```javascript
export default {
  images: {
    domains: ['your-cdn.com'],
  },
}
```

### 3. Database Connection Pooling

Supabase handles this automatically with connection pooling.

### 4. CDN for Static Assets

Vercel provides this automatically. For self-hosted, use CloudFlare or similar.

---

## Monitoring & Analytics

### 1. Vercel Analytics

Already included in the project via `@vercel/analytics`.

### 2. Supabase Monitoring

Monitor database performance in Supabase Dashboard → Database → Metrics

### 3. Error Tracking

Consider adding Sentry:

```bash
npm install @sentry/nextjs
```

Initialize in `app/layout.tsx`.

### 4. Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## Security Checklist

Before going to production:

- [ ] Enable HTTPS (automatic on Vercel/Netlify)
- [ ] Set strong JWT_SECRET
- [ ] Enable RLS policies in Supabase
- [ ] Review CORS settings
- [ ] Enable rate limiting (optional)
- [ ] Set up backup strategy
- [ ] Configure email provider in Supabase
- [ ] Test 2FA flow completely
- [ ] Review admin user list
- [ ] Set up monitoring alerts
- [ ] Configure custom domain
- [ ] Update Supabase redirect URLs
- [ ] Test password reset flow
- [ ] Review activity logs

---

## Backup Strategy

### Database Backups

Supabase provides automatic daily backups on paid plans. For manual backups:

```bash
# Export database
supabase db dump -f backup.sql

# Restore
supabase db push -f backup.sql
```

### Code Backups

Your code is backed up in Git. Ensure you:
- Push regularly
- Use branches for features
- Tag releases

---

## Scaling Considerations

### Database Scaling

Supabase auto-scales, but monitor:
- Connection count
- Query performance
- Storage usage

### Application Scaling

Vercel auto-scales based on traffic. For self-hosted:
- Use load balancer
- Multiple app instances
- Redis for session storage (optional)

---

## Cost Estimation

### Free Tier (Perfect for Demo/Testing)

- **Vercel**: Free (Hobby plan)
- **Supabase**: Free (Up to 500MB database, 2GB bandwidth)
- **Total**: $0/month

### Production (Low Traffic)

- **Vercel**: $20/month (Pro plan)
- **Supabase**: $25/month (Pro plan)
- **Domain**: $12/year
- **Total**: ~$45/month

### Production (High Traffic)

- **Vercel**: $20-100/month
- **Supabase**: $25-100/month
- **CDN**: $0-50/month
- **Total**: $45-250/month

---

## Environment-Specific Configs

### Development
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-dev-key
```

### Staging
```env
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key
```

### Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
```

---

## Troubleshooting Deployment

### Build Failures

**Error: Module not found**
- Run `npm install` locally
- Ensure all imports use correct paths
- Check `tsconfig.json` paths

**Error: Environment variable missing**
- Verify all env vars are set in platform
- Check variable names (case-sensitive)
- Restart deployment after adding vars

### Runtime Errors

**Error: Failed to fetch**
- Check Supabase URL is correct
- Verify API keys are valid
- Check CORS settings

**Error: Unauthorized**
- Verify JWT_SECRET matches
- Check Supabase redirect URLs
- Clear browser cookies

---

## Post-Deployment

1. **Test all features**
2. **Monitor error logs** (Vercel Dashboard → Logs)
3. **Check Supabase metrics**
4. **Set up status page** (optional)
5. **Create admin account**
6. **Share app URL** 🎉

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Congratulations!** Your app is now live! 🚀
