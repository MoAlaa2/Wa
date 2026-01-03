# API Configuration Guide

## Available API Endpoints

The backend API is available at:
- **Production URL 1:** `https://api.guthmi.site/api`
- **Production URL 2:** `https://guthmi-api-production.up.railway.app/api`
- **Development:** `http://localhost:3000/api` (with proxy)

## Configuration

### For Development (localhost)

1. Create a `.env.local` file in `/src/frontend/`:
```bash
# No configuration needed - uses proxy by default
```

The development server will proxy `/api` requests to `http://localhost:3000/api` automatically.

### For Production Build

1. Create a `.env.production.local` file in `/src/frontend/`:
```bash
VITE_API_BASE_URL=https://api.guthmi.site/api
```

Or use the Railway URL:
```bash
VITE_API_BASE_URL=https://guthmi-api-production.up.railway.app/api
```

2. Build the app:
```bash
npm run build
```

## Environment Files

- `.env.development` - Development environment (uses proxy)
- `.env.production` - Production environment (uses direct API URL)
- `.env.example` - Example configuration file

## How It Works

The frontend uses these API configurations in:

1. **AuthContext.tsx** - For authentication requests
2. **whatsappService.ts** - For all WhatsApp API requests

Both files read from `import.meta.env.VITE_API_BASE_URL` which:
- In development: Falls back to `/api` (proxied to localhost:3000)
- In production: Uses the configured production API URL

## Testing the Configuration

### Test Development:
```bash
npm run dev
# Opens http://localhost:5173
# API calls go to http://localhost:3000/api via proxy
```

### Test Production Build:
```bash
npm run build
npm run preview
# Opens http://localhost:4173
# API calls go to configured VITE_API_BASE_URL
```

## Current Configuration Status

✅ **Development:** Proxy configured for `localhost:3000`  
✅ **Production:** Set to `https://api.guthmi.site/api`  
✅ **TypeScript:** Environment types defined in `vite-env.d.ts`  
✅ **Axios Interceptors:** Token management and 401 handling configured
