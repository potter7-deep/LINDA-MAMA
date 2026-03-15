# Linda Mama Backend - Render Deployment Guide (Fixed for Build Error)

## Prerequisites
- Render account (free tier OK)
- GitHub repo pushed with pre-built frontend assets in `backend/public/`
- Env vars: `JWT_SECRET`, `CORS_ORIGIN`, `DB_PATH`

## Pre-Deploy (Local)
```
cd frontend && npm i && npm run build
rsync -a dist/ ../backend/public/
cd ../backend && npm run seed:prod
git add backend/public backend/package.json && git commit -m "Pre-build frontend + Render fix" && git push
```

## Step-by-Step Deployment

### 1. Connect Repo
```
dashboard.render.com → New → Web Service → Connect GitHub → main branch
```

### 2. Configure Service
```
Name: linda-mama-backend
Environment: Node
Region: Oregon (closest)
Root Directory: backend/
**Build Command: npm install**
**Start Command: npm run start**
Instance Type: Free
```

### 3. Environment Variables
| Key | Value |
|-----|-------|
| JWT_SECRET | `openssl rand -base64 32` |
| CORS_ORIGIN | `*` (dev) or `https://your-frontend.onrender.com` |
| DB_PATH | `/opt/render/project/src/db/linda_mama.db` |

### 4. Persistent Disk (SQLite)
```
Dashboard → Disks → Connect 1GB → Path: /opt/render/project/src/db
```

### 5. Deploy & Verify
```
Build succeeds: npm ci --production + seed:prod
Live: https://linda-mama-backend-abc.onrender.com
Health: /api/health
API: /api/docs  
Demo: provider@lindamama.com / provider123
```

## Troubleshooting Build Error (Fixed)
- **Previous**: Workspaces/monorepo cd ../frontend failed
- **Now**: Static assets in public/, backend-only build

## Logs
Dashboard → Logs | Shell for `npm run seed`

**Updated:** $(date)
