# Linda Mama Render.com Deployment TODO

## Plan Status: ✅ APPROVED

### 1. File Edits & Setup (AI Complete)
- [x] Create this TODO.md
- [x] Update `backend/package.json` - Add `postinstall: npm run build`
- [ ] Update `backend/config/database.js` - Ensure Render DB_PATH handling
- [ ] Update `backend/deploy.sh` - Render-compatible version
- [ ] Update `README.md` - Add Render deployment instructions
- [ ] Create `backend/.env.example` - Env var template

### 2. Environment Variables (Manual - Render Dashboard)
```
NODE_ENV=production
DB_PATH=/opt/render/project/src/linda_mama.db
CORS_ORIGIN=https://linda-mama.onrender.com
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-2024
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10
```

### 3. Render Deployment (Manual Steps)
- [ ] Push code to GitHub repo
- [ ] Render.com → New Web Service → Connect GitHub repo (root: backend/)
- [ ] Build Command: `npm ci`
- [ ] Start Command: `node index.js`
- [ ] Add Disk: `/opt/render/project/src` (10GB)
- [ ] Set all env vars above
- [ ] Deploy & test https://linda-mama.onrender.com/api/health

### 4. Verification
- [ ] App loads at root URL
- [ ] API health check works
- [ ] Database persists (login with seeded accounts)
- [ ] Demo accounts work: grace@email.com / password123

### 5. Post-Deploy (Optional)
- [ ] Custom domain
- [ ] Auto-deploys from GitHub
- [ ] Monitoring/alerts
- [ ] Scale instance if needed

**Next: Proceed to file edits (step 1).**
