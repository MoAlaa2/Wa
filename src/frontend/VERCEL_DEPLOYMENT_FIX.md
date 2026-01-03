# 🚀 VERCEL DEPLOYMENT FIX

## ❌ The Problem

**Local:** Login works  
**Vercel:** Login fails with "Email and password are required" or 401

---

## 🔍 Root Cause

```typescript
// ❌ WRONG (fails on Vercel)
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

**Why it fails:**
1. `.env` files are NOT deployed to Vercel (in `.gitignore`)
2. `VITE_API_BASE_URL` is undefined on Vercel
3. Falls back to `/api` → resolves to frontend domain (`vercel.app/api`)
4. No backend at `/api` on Vercel → 404/401

**Why it worked locally:**
- Vite dev proxy forwards `/api` → `localhost:3000/api`
- See `vite.config.ts`:
  ```typescript
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
  ```

---

## ✅ The Fix

### 1. **Code Changes (DONE)**

```typescript
// ✅ CORRECT (works everywhere)
const API_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://guthmi-api-production.up.railway.app/api';
```

**Files updated:**
- ✅ `context/AuthContext.tsx`
- ✅ `services/whatsappService.ts`

---

### 2. **Vercel Environment Variables (REQUIRED)**

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_BASE_URL` | `https://guthmi-api-production.up.railway.app/api` | Production, Preview |

**CRITICAL:** 
- Variable name MUST start with `VITE_` (Vite requirement)
- Apply to both **Production** and **Preview** environments
- Redeploy after adding the variable

---

### 3. **Local Development**

`.env.development` (already configured):
```bash
VITE_API_BASE_URL=/api
```

**Why `/api` works locally:**
- Vite proxy intercepts and forwards to `localhost:3000`
- No CORS issues
- Same behavior as production

---

### 4. **Verify the Fix**

#### Local Test:
```bash
npm run dev
# Open http://localhost:5173
# Try login → should work
```

#### Production Test (after deploying to Vercel):
```bash
# Open your Vercel URL
# Try login → should work

# Check Network tab in DevTools:
# Request URL should be: https://guthmi-api-production.up.railway.app/api/auth/login
# NOT: https://your-app.vercel.app/api/auth/login
```

---

## 📋 Deployment Checklist

- [x] Code updated with Railway URL as fallback
- [ ] Add `VITE_API_BASE_URL` in Vercel Dashboard
- [ ] Redeploy on Vercel
- [ ] Test login on production URL
- [ ] Check Network tab confirms Railway API is called

---

## 🛠️ Alternative URLs

If you prefer using the custom domain:

**Vercel Environment Variable:**
```
VITE_API_BASE_URL=https://api.guthmi.site/api
```

**Code fallback (optional):**
```typescript
const API_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://api.guthmi.site/api';
```

---

## 🔧 Troubleshooting

### Issue: Still getting 401/404 on Vercel

**Check:**
1. Did you add the env var in Vercel Dashboard?
2. Did you **redeploy** after adding it?
3. Open DevTools → Network tab
4. Look at the request URL for `/auth/login`
5. Should be Railway URL, NOT Vercel URL

### Issue: CORS errors

**Solution:** Add to your Railway backend (Express):
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### Issue: Token not persisting

**Check:** 
- Backend sets correct CORS headers
- Frontend uses `credentials: true` in axios (if sending cookies)

---

## 📝 Summary

**The fix:**
1. ✅ Changed fallback from `/api` → Railway URL
2. ⚠️ Must set `VITE_API_BASE_URL` in Vercel Dashboard
3. ✅ Works in both development (proxy) and production (direct URL)

**Why it works now:**
- Development: `/api` → Vite proxy → `localhost:3000`
- Production: Railway URL → direct API call (no proxy needed)
