# Coolify Deployment Guide

Deploying Org Comms to Coolify from GitHub.

## Prerequisites

1. Coolify instance running (v4 or later)
2. GitHub repository connected to Coolify
3. Convex project deployed (production deployment recommended)

---

## Step 1: Create New Resource in Coolify

1. Go to your Coolify dashboard
2. Click **"Create New Resource"**
3. Select **"Application"**
4. Choose **GitHub** as source
5. Select your repository: `Kieransaunders/convex-broadcast`
6. Branch: `main`

---

## Step 2: Build Settings

### Build Configuration

| Setting | Value |
|---------|-------|
| **Build Pack** | `Dockerfile` |
| **Dockerfile Location** | `./Dockerfile` |
| **Base Directory** | `/` |

If Dockerfile option isn't available, use **Nixpacks** or **Static** with these settings:

### Alternative: Nixpacks Build

| Setting | Value |
|---------|-------|
| **Build Pack** | `Nixpacks` |
| **Install Command** | `npm ci` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

---

## Step 3: Environment Variables

### Required Environment Variables

Add these in Coolify → Your App → Environment Variables:

```bash
# Convex Configuration (REQUIRED)
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site

# Better Auth Configuration (REQUIRED)
BETTER_AUTH_SECRET=your-generated-secret-min-32-chars
SITE_URL=https://your-coolify-domain.com

# Super Admin Setup (Optional - for first user)
SUPER_ADMIN_EMAIL=admin@yourdomain.com

# Email Configuration (Optional - for auth emails)
RESEND_API_KEY=re_your_api_key

# Push Notifications (Optional - for browser push)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_CONTACT_EMAIL=mailto:admin@yourdomain.com
```

### Generate Required Secrets

**Generate BETTER_AUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Generate VAPID keys (for push notifications):**
```bash
npx web-push generate-vapid-keys
```

---

## Step 4: Convex Production Setup

### 1. Create Production Deployment

```bash
# In your local project
npx convex deploy
```

### 2. Set Environment Variables in Convex Dashboard

Go to https://dashboard.convex.dev → Your Project → Settings → Environment Variables

Add the same environment variables (except VITE_ prefixed ones):

```bash
BETTER_AUTH_SECRET=...
SITE_URL=https://your-coolify-domain.com
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_CONTACT_EMAIL=mailto:admin@yourdomain.com
RESEND_API_KEY=...
SUPER_ADMIN_EMAIL=...
```

### 3. Update Frontend Environment Variables

Get your production Convex URLs:
```bash
npx convex env list
```

Update Coolify environment with production URLs:
```bash
VITE_CONVEX_URL=https://your-production.convex.cloud
VITE_CONVEX_SITE_URL=https://your-production.convex.site
```

---

## Step 5: Dockerfile

Create a `Dockerfile` in your repo root:

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

---

## Step 6: Domain & SSL

### Custom Domain (Optional)

1. In Coolify: Your App → Settings → Domains
2. Add your domain: `orgcomms.yourdomain.com`
3. Point DNS A record to your Coolify server IP
4. Enable SSL (Let's Encrypt)

### Update Convex CORS & Site URL

After setting your custom domain, update Convex:

```bash
# Set production site URL in Convex
npx convex env set SITE_URL https://orgcomms.yourdomain.com
```

---

## Step 7: Health Check

Add health check in Coolify:

| Setting | Value |
|---------|-------|
| **Health Check Path** | `/` |
| **Health Check Port** | `3000` |

---

## Step 8: Deploy

1. Click **"Deploy"** in Coolify
2. Wait for build to complete
3. Check logs for any errors
4. Visit your deployed URL

---

## Troubleshooting

### Build Failures

**Error: "Cannot find module"**
- Check that `npm ci` runs successfully
- Ensure all dependencies are in package.json

**Error: "Convex deployment not found"**
- Verify `VITE_CONVEX_URL` is set correctly
- Ensure Convex production deployment exists

### Runtime Errors

**Error: "Better Auth secret not configured"**
- Set `BETTER_AUTH_SECRET` in both Coolify AND Convex dashboard

**Error: "Push notifications not working"**
- VAPID keys must be set in Convex dashboard (not just Coolify)
- `VITE_VAPID_PUBLIC_KEY` must be set in Coolify for frontend

**CORS Errors**
- Update `SITE_URL` in Convex to match your Coolify domain exactly
- Check that `VITE_CONVEX_SITE_URL` includes the `/convex.site` suffix

### Check Logs

```bash
# View Coolify app logs
# In Coolify Dashboard → Your App → Logs
```

---

## Quick Reference: Environment Variables

### Coolify Environment (Frontend + Server)

| Variable | Required | Source |
|----------|----------|--------|
| `VITE_CONVEX_URL` | Yes | Convex Dashboard → URL |
| `VITE_CONVEX_SITE_URL` | Yes | Convex Dashboard → Site URL |
| `BETTER_AUTH_SECRET` | Yes | Generated |
| `SITE_URL` | Yes | Your Coolify domain |

### Convex Dashboard (Backend)

| Variable | Required | Source |
|----------|----------|--------|
| `BETTER_AUTH_SECRET` | Yes | Same as Coolify |
| `SITE_URL` | Yes | Same as Coolify |
| `VAPID_PUBLIC_KEY` | Optional | web-push generate |
| `VAPID_PRIVATE_KEY` | Optional | web-push generate |
| `VAPID_CONTACT_EMAIL` | Optional | Your email |
| `RESEND_API_KEY` | Optional | Resend dashboard |
| `SUPER_ADMIN_EMAIL` | Optional | Your admin email |

---

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Sign up / Sign in works
- [ ] Can create and send messages
- [ ] Push notifications work (if configured)
- [ ] PWA install prompt appears
- [ ] Service worker registers successfully

---

## Updating Deployment

Push to GitHub main branch → Coolify auto-deploys (if auto-deploy enabled)

Or manually:
1. Push changes to GitHub
2. Click "Redeploy" in Coolify

---

## Support

- Convex docs: https://docs.convex.dev
- TanStack Start: https://tanstack.com/start
- Coolify docs: https://coolify.io/docs
