# Coolify Quickstart - GitHub Deployment

## Essential Settings Summary

### 1. Source Configuration
| Setting | Value |
|---------|-------|
| **Repository** | `Kieransaunders/convex-broadcast` |
| **Branch** | `main` |
| **Build Pack** | `Dockerfile` |

### 2. Build Configuration
| Setting | Value |
|---------|-------|
| **Dockerfile Path** | `./Dockerfile` |
| **Base Directory** | `/` |
| **Publish Directory** | (leave empty - handled by Dockerfile) |

### 3. Environment Variables (REQUIRED)

Add these in Coolify → Your App → Environment Variables:

```bash
# Convex URLs (get from https://dashboard.convex.dev)
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CONVEX_SITE_URL=https://your-project.convex.site

# Better Auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-32-char-secret-here
SITE_URL=https://your-coolify-domain.com
```

### 4. Port Configuration
| Setting | Value |
|---------|-------|
| **Expose Port** | `3000` |
| **Domain** | Auto-generated or custom |

---

## Before First Deploy

### Step 1: Deploy Convex Backend
```bash
# Locally, deploy to production
npx convex deploy
```

### Step 2: Set Convex Environment Variables
Go to https://dashboard.convex.dev → Your Project → Settings → Environment Variables

```bash
BETTER_AUTH_SECRET=your-32-char-secret-here
SITE_URL=https://your-coolify-domain.com
```

### Step 3: Get Convex URLs
```bash
npx convex env list
```
Copy these to Coolify:
- `VITE_CONVEX_URL` → Your Convex URL
- `VITE_CONVEX_SITE_URL` → Your Convex Site URL

---

## Deployment Steps

1. **Push Dockerfile to GitHub**
   ```bash
   git add Dockerfile .dockerignore
   git commit -m "Add Coolify deployment files"
   git push
   ```

2. **In Coolify:**
   - Create New Resource → Application
   - Select GitHub → `Kieransaunders/convex-broadcast`
   - Build Pack: `Dockerfile`
   - Add Environment Variables (above)
   - Deploy

3. **Update Convex with your domain:**
   ```bash
   npx convex env set SITE_URL https://your-coolify-domain.com
   ```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check `VITE_CONVEX_URL` is set correctly |
| "Cannot connect to backend" | Verify Convex production deployment exists |
| Auth not working | Ensure `BETTER_AUTH_SECRET` matches in Coolify AND Convex |
| CORS errors | Update `SITE_URL` in Convex to match Coolify domain |

---

## Check Deployment

```bash
# Check if app is running
curl https://your-coolify-domain.com

# Check health endpoint
curl https://your-coolify-domain.com/api/health
```

---

## Next Steps

- [ ] Set up custom domain
- [ ] Configure SSL (auto-enabled in Coolify)
- [ ] Add VAPID keys for push notifications
- [ ] Configure Resend for email
- [ ] Set up backups
