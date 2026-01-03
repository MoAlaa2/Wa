# Railway Deployment Guide

## Current Setup
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
Before testing, clear your browser's localStorage:
```javascript
// Open browser console on your site and run:
localStorage.clear();
location.reload();
```

### 2. Test Login Flow
1. Go to https://wa-production-d791.up.railway.app/
2. It should redirect to login (you shouldn't see 401 errors in console yet)
3. Enter valid credentials and login
4. Check Network tab - should see successful API calls with 200 status

### 3. Test API Health
```bash
curl https://guthmi-api-production.up.railway.app/api/health
```

## Common Issues

### Issue: Still getting 401 errors
**Solution**: 
1. Clear browser cache and localStorage
2. Make sure you're using valid login credentials
3. Check that the backend JWT tokens are being generated correctly

### Issue: CORS errors
**Solution**: Already fixed! Backend is returning correct CORS headers.

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

## Local Development

To run locally:
```bash
cd src/frontend
npm install
npm run dev
```

Make sure you have a backend running on `http://localhost:3000` or the proxy will fail.
