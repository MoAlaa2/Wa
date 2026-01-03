# Railway Deployment Guide

## Quick Reference

| Item | Value |
|------|-------|
| **Frontend URL** | https://wa-production-d791.up.railway.app/ |
| **Backend URL** | https://guthmi-api-production.up.railway.app/api |
| **Login Email** | info@guthmi.com |
| **Login Password** | Admin@123 |
| **Latest Commit** | ae8a116 - Null safety fixes |

## ✅ Verification Complete

**Backend Status:** 🟢 Fully Operational
- Health check: ✅ Passing
- Login endpoint: ✅ Returns 200 with token
- Templates endpoint: ✅ Working (returns empty array)
- CORS: ✅ Configured for all origins

**Current Issue:** Frontend browser cache showing old compiled JavaScript files

**Solution:** Clear browser cache or wait for Railway frontend deployment

---

## Quick Start - Login Immediately

1. **Wait 2-3 minutes** for Railway frontend deployment to complete
2. **Open Incognito/Private window** (bypasses cache)
   - Chrome: `Cmd+Shift+N` (Mac) / `Ctrl+Shift+N` (Windows)
   - Firefox: `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows)
3. **Navigate to:** https://wa-production-d791.up.railway.app/
4. **Login with:**
   - Email: `info@guthmi.com`
   - Password: `Admin@123`
5. **Success!** You should now be logged in without errors

---
- **Frontend**: https://wa-production-d791.up.railway.app/
- **Backend**: https://guthmi-api-production.up.railway.app/api

## Issues Fixed

### 1. Notification Context Authentication Check ✅
The `NotificationContext` was trying to fetch notifications before user authentication. This has been fixed to check for token before making requests.

### 2. Vite Proxy Configuration ✅
Added proxy configuration for local development in `vite.config.ts`.

### 3. CORS Configuration ✅
Backend CORS is already properly configured and allows requests from the frontend domain.

### 4. Null/Undefined Safety Checks ✅
Added proper null/undefined checks for all `.toLocaleString()` and data access calls across:
- Dashboard analytics display
- Internal notifications timestamps
- Order history audit log
- Contact import history

This prevents crashes when data is loading or missing.

## Deployment Steps

### Frontend (Current Service)

1. **Set Environment Variable in Railway Dashboard**:
   - Go to your frontend Railway service
   - Navigate to Variables tab
   - Add: `VITE_API_BASE_URL=https://guthmi-api-production.up.railway.app/api`

2. **Commit and Push Changes**:
   ```bash
   git add .
   git commit -m "Fix: Add authentication check and proxy configuration"
   git push
   ```

3. **Railway will automatically rebuild and redeploy**

### Backend Service

Make sure your backend has these CORS origins allowed:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://wa-production-d791.up.railway.app',
  'https://guthmi.online'
];
```

## Testing After Deployment

### 1. Clear Browser Data
Before testing, clear your browser's cache and localStorage:

**Option A: Use Incognito/Private Window**
- Chrome: Cmd+Shift+N (Mac) or Ctrl+Shift+N (Windows)
- Firefox: Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)

**Option B: Hard Refresh**
- Mac: Cmd+Shift+R
- Windows/Linux: Ctrl+Shift+R

**Option C: Clear All Cache**
```javascript
// Open browser console on your site and run:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### 2. Test Login Flow
1. Go to https://wa-production-d791.up.railway.app/
2. Wait for Railway deployment to complete (check Railway dashboard)
3. Use the correct credentials:
   - **Email:** `info@guthmi.com`
   - **Password:** `Admin@123`
4. Check Network tab - should see successful API calls with 200 status

### 3. Verify Backend is Running
```bash
# Test the backend API directly
curl -s -X POST https://guthmi-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "info@guthmi.com", "password": "Admin@123"}' | jq .
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "info@guthmi.com",
    "role": "admin",
    ...
  }
}
```

## Common Issues

### Issue: Still getting 401 errors
**Solution**: 
1. **Check Railway deployment status** - Go to Railway dashboard and verify the frontend build completed successfully
2. **Clear browser cache completely** - Use Incognito mode or hard refresh (Cmd+Shift+R)
3. **Verify credentials** - Use `info@guthmi.com` with password `Admin@123`
4. **Check backend logs** - If backend is returning 401, credentials might have changed

### Issue: Templates showing 500 error
**Solution**: 
1. **Check backend logs** on Railway for the guthmi-api-production service
2. **Verify environment variables** - Make sure WhatsApp API credentials are set
3. **Check database** - Ensure templates table exists and is accessible
4. The frontend now handles this gracefully - page won't crash, just shows empty state

### Issue: CORS errors
**Solution**: Already fixed! Backend is returning correct CORS headers:
```
access-control-allow-origin: https://wa-production-d791.up.railway.app
```

### Issue: Environment variables not working
**Solution**: 
1. In Railway dashboard, make sure `VITE_API_BASE_URL` is set
2. Railway automatically rebuilds when you change variables
3. Wait for deployment to complete

## What Changed

### Files Modified:
1. **vite.config.ts** - Added proxy for local development
2. **NotificationContext.tsx** - Added authentication check before fetching
3. **AuthContext.tsx** - Added explicit Content-Type header
4. **.env.production** - Clarified for Railway deployment
5. **Dashboard/index.tsx** - Added null checks for analytics data (totalMessages, readRate, totalCost, failedRate)
6. **InternalNotifications/index.tsx** - Added timestamp null check
7. **Orders/OrderDetailsDrawer.tsx** - Added timestamp null check for audit log
8. **Contacts/ImportPage.tsx** - Added startedAt null check
9. **Templates/index.tsx** - Added null checks for template.name and error handling
10. **Contacts/ContactsPage.tsx** - Added null checks for firstName and phone
11. **Automation/KnowledgeBase/index.tsx** - Added null checks for question and tags
12. **ContentLibrary/QuickReplies/index.tsx** - Added null checks for shortcut and content
13. **Notifications/index.tsx** - Added null check for campaign title
14. **Orders/index.tsx** - Added null checks for orderNumber, customerName, customerPhone
15. **Inbox/ChatInput.tsx** - Added null check for quick reply shortcut

## Local Development

To run locally:
```bash
cd src/frontend
npm install
npm run dev
```

Make sure you have a backend running on `http://localhost:3000` or the proxy will fail.
