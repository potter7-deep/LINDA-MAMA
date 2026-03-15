# Linda Mama Backend - Render Deployment Guide

## Prerequisites
- Render account (free tier OK for dev)
- GitHub repo with this code pushed
- Required env vars: `JWT_SECRET`, `CORS_ORIGIN` (your frontend URL)

## Step-by-Step Deployment

### 1. Fork/Connect Repo
```
1. Login to https://dashboard.render.com
2. New > Web Service
3. Connect your GitHub repo (linda-mama-backend or full monorepo)
4. Select branch (main)
```

### 2. Configure Service
```
Name: linda-mama-backend (or your choice)
Environment: Node
Region: Closest (Oregon/Singapore for Kenya)
Branch: main
Root Directory: backend/ (if monorepo)
Build Command: npm ci
Start Command: npm start
Instance Type: Free
```

### 3. Environment Variables
Add these in Render Dashboard > Environment:

| Key | Value | Notes |
|-----|-------|-------|
| `JWT_SECRET` | `your-super-secret-jwt-key-min32chars` | Generate: `openssl rand -base64 32` |
| `CORS_ORIGIN` | `https://your-frontend.onrender.com` | Frontend domain (or `*` dev only) |
| `NODE_ENV` | `production` | Auto-set |
| `DB_PATH` | `/opt/render/project/src/db/linda_mama.db` | **Critical** |

### 4. Persistent Disk (CRITICAL for SQLite)
```
Dashboard > Shell tab > Run:
mkdir -p /opt/render/project/src/db
```
- **Add Disk**: Dashboard > Disks > Connect 1GB disk at `/opt/render/project/src/db`
- SQLite data persists across deploys/restarts

### 5. Auto-Deploy & Seed
```
Build: npm ci (installs deps, builds public assets)
Start: npm start (runs index.js)
Seed: Runs automatically on first deploy (idempotent)
```

Render runs postinstall hooks + `npm run seed` if in package.json scripts.

### 6. Verify Deployment
```
Health: https://your-service.onrender.com/api/health
API Docs: https://your-service.onrender.com/api
Demo Login: provider@lindamama.com / provider123
```

### 7. Logs & Debug
```
Dashboard > Logs (real-time)
Shell: render.com shell access
DB Path: Check /opt/render/project/src/db/linda_mama.db exists
```

## Troubleshooting
- **Disk full**: Upgrade to 5GB or prune logs/db
- **Port bind**: Render auto-ports; code uses `process.env.PORT || 3000`
- **CORS**: Update CORS_ORIGIN after frontend deploy
- **Seed fail**: Manual `npm run seed` in shell

## Production Scaling
```
Paid Instance: $7/mo (512MB RAM, always-on)
Auto-scaling: Render Pro ($25+/mo)
DB Upgrade: Render PostgreSQL + migrate schema
CDN: Add Render CDN ($5/mo)
```

## deploy.sh Local Test
```
cd backend
chmod +x deploy.sh
JWT_SECRET=xxx CORS_ORIGIN=http://localhost:5173 ./deploy.sh
```

**Deployed URL:** https://linda-mama-backend-abc123.onrender.com

**Last Updated:** `date`

