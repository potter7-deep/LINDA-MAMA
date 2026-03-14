# 🏥 Linda Mama - Maternal Healthcare System

## 🌟 Features
- Pregnancy tracking & milestones
- Personalized nutrition plans
- Immunization schedules
- Emergency reporting & provider alerts
- Chat between mothers/providers
- Exercise & mood tracking
- Admin dashboard

## 🚀 Quick Start (Local)

```bash
# Install & build
npm install
npm run build:frontend && npm run build:backend

# Development
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3000

# Production build
npm run build:backend  # Builds frontend + copies to backend/public + seeds DB
npm start              # http://localhost:3000
```

**Test Accounts** (after build/backend seed):
```
Admin: admin@lindamama.ke / password123
Provider: provider@lindamama.ke / password123
Mother: grace@email.com / password123
```

## ☁️ Production Deployment (Render.com)

### 1. **Repository** 
Push to GitHub → Connect Render

### 2. **Environment Variables** (Render Dashboard)
```
JWT_SECRET=your-super-secure-random-64-char-secret
CORS_ORIGIN=https://your-app.onrender.com
NODE_ENV=production
DB_PATH=/opt/render/project/src/linda_mama.db
```

### 3. **Settings**
```
Build Command: cd frontend && npm ci && npm run build && cd ../backend && npm ci && rsync -a ../frontend/dist/ ./public/ && npm run seed
Start Command: npm start
Instance Type: Free/Mini
Disk: Persistent (10GB+)
```

### 4. **Verify**
```
Health: https://your-app.onrender.com/api/health
Demo Login: admin@lindamama.ke / password123
```

## 🛠️ Project Structure
```
linda-mama/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Express + SQLite + JWT
│   ├── public/        # Built frontend served here
│   ├── seed/          # Demo data
│   └── deploy.sh      # PM2/Production
├── .env.example       # Env vars
└── package.json       # Workspaces
```

## 🔒 Security
- JWT authentication (24h tokens)
- Rate limiting (auth: 10/min, API: 100/15min)
- Helmet CSP/HSTS
- bcrypt password hashing
- SQLite WAL mode + indexes

## 📱 Responsive
- Mobile-first Tailwind
- Dark mode
- PWA-ready

## 🤝 Contributing
1. Fork → Clone → Create feature branch
2. `npm install && npm run build:backend`
3. Test locally
4. PR with changelog

**Live Demo**: https://linda-mama.onrender.com

