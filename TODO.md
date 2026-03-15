# Linda Mama - Registration to Dashboard Fix
## Status: ✅ Plan Approved - In Progress

## Step-by-Step Implementation Plan

### 1. 🔧 Fix Critical Auth Middleware Bug ✅ **DONE**
- **File**: `backend/middleware/auth.js`
- **Issue**: DB query uses `[decoded.userId]` (array) instead of `decoded.userId` (scalar)
- **Action**: Remove `[]` wrapper in `db.get()` query
- **Expected**: `/api/auth/me` succeeds post-register → dashboard loads

### 2. 📝 Improve AuthContext UX ✅ **DONE**
- **Action**: Add `await fetchUser()` in `register()` to wait for profile sync
- **Expected**: Eliminates race condition

### 3. 🎯 Role-Based Redirects ✅ **DONE**
- **Action**: Redirect based on user.role (mother→dashboard, provider→provider, admin→admin)
- **Expected**: Better UX for different user types

### 4. 🧪 Local Testing [CURRENT]\n```\ncd backend && npm install && npm start\ncd ../frontend && npm install && npm run dev\n```\n- Register new 'mother' user\n- Verify navigates to `/app/dashboard`\n- Check Network tab: /auth/me returns 200\n\n### 5. 🚀 Deploy to Live Site\n```\ncd backend && ./deploy.sh  # or manual Render/Heroku deploy\ncd frontend && npm run build && deploy\n```\n- Verify live registration flow\n- Clear browser cache/cookies for testing

### 6. ✅ Verification Checklist
- [ ] Register mother → lands on Dashboard
- [ ] Register provider → lands on ProviderDashboard  
- [ ] Login existing user → works
- [ ] Token persists across tabs
- [ ] /api/health returns healthy

### 7. 📊 Monitoring
```
# Check backend logs
tail -f backend/logs/app.log  # if exists

# Test auth endpoints
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123","fullName":"Test User","role":"mother"}'
```

## Completion Criteria
- New registrations successfully reach their role-specific dashboard
- No 401 errors on /auth/me after register
- All tests pass

---

**Next Action**: Fix `backend/middleware/auth.js` DB query parameter
