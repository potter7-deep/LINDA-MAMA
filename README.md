# 🏥 Linda Mama - Maternal Healthcare Management System

## 🎯 Problem Statement

Kenya faces significant maternal health challenges:
- **High maternal mortality rate** (342 per 100,000 live births)
- **Fragmented patient records** across facilities
- **Delayed emergency response** (average 4+ hours)
- **Poor nutrition tracking** leading to complications
- **Immunization gaps** causing child health risks

**Linda Mama** solves these with a **comprehensive digital platform**.

## ✨ Core Features

### 🤰 **Expectant & Nursing Mothers**
```
📊 Pregnancy Tracking (weeks, milestones, vitals)
🥗 AI Nutrition Plans (trimester-specific)
💉 Immunization Schedules + Reminders
🚨 Emergency Reporting (GPS + instant alerts)
📈 Health Metrics Dashboard (weight, BP, contractions)
```

### 👨‍⚕️ **Healthcare Providers**
```
👥 Patient Management Dashboard
🔔 Real-time Emergency Alerts
📋 Complete Medical History Access
📱 Mobile-First Case Management
📊 Patient Progress Reports
```

### 👑 **Administrators**
```
👥 User & Role Management
📈 System Analytics Dashboard
🔍 Audit Logs & Compliance
⚙️ Facility Management
📊 Population Health Insights
```

## 🏥 Impact Goals

| Metric | Current | Target |
|--------|---------|--------|
| Emergency Response | 4+ hours | <30 min |
| Nutrition Compliance | 42% | 85% |
| Immunization Coverage | 71% | 95% |
| Maternal Mortality | 342/100k | 100/100k |

## 🔬 Tech Architecture

```
Frontend: React 18 + Vite + TailwindCSS
Backend: Node.js + Express + SQLite
Security: JWT + Rate Limiting + Helmet
Deployment: Render.com (Free Tier Ready)
Responsive: Mobile-First Design
```

## 🎯 Kenyan Context
- **Linda Mama Scheme** integration ready
- **Huduma Centres** connectivity
- **M-Pesa** payment gateway prepared
- **Offline-first** capability planned
- **Swahili localization** supported

**Made with ❤️ for Kenyan mothers**

[Deployed Live](https://linda-mama.onrender.com)

## 🛫 Render.com Deployment Guide

### 🚀 Quick Start (Free Tier)

1. Push to GitHub repository
2. [Render Dashboard](https://dashboard.render.com) → New → Web Service → Connect GitHub repo
3. **Settings**:
   - Runtime: **Node**
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
4. Deploy!

### ⚙️ Environment Variables (Environment tab)

```
NODE_ENV=production
JWT_SECRET=generate-a-super-secure-64-char-jwt-secret-here
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
CORS_ORIGIN=https://your-app-name.onrender.com  # Optional for SPA
DB_PATH=/data/linda_mama.db  # With persistent disk
```

### 💾 Database Options

**Free Tier (Ephemeral SQLite)**: Data resets on redeploy/sleep wakeup

**Starter ($7/mo, Recommended)**:
1. Add Persistent Disk (`/data`, 1GB)
2. Set `DB_PATH=/data/linda_mama.db`
3. Initial seed: Render Shell → `cd backend && npm run seed`

### 🔍 Verification

- Health: `https://your-app.onrender.com/api/health`
- Frontend: Root path loads dashboard
- Demo login: grace@email.com / password123

### 📈 Scale & Upgrade

- Instance Type: Free → Starter for persistence
- Custom Domain support
- Auto deploys on git push

**Note**: Seed script clears data (demo only). Production data backup manual.
