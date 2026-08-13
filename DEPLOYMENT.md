# Production Deployment & Live Configuration Guide

This guide provides end-to-end instructions for deploying the **Cook & Home Maid Booking Platform** to production environments (Ubuntu VPS, Render, Railway, Vercel, and MongoDB Atlas).

---

## 1. Production Environment Variables Reference

### Backend (`backend/.env`)

```ini
# Application Setup
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1

# MongoDB Atlas Database URI (SSL / Replica Set Enabled)
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cluster0.mongodb.net/cook_maid_booking?retryWrites=true&w=majority

# JWT Token Secrets (Minimum 32 Random Hex/Base64 Characters)
JWT_ACCESS_SECRET=a8f9c2d7e1b4f6a3c9e2d5b8f1a4c7e0d3f6a9c2e5b8f1a4c7e0d3f6a9c2e5b8
JWT_REFRESH_SECRET=b9f0d3e8f2c5a7b4d0f3e6c9a2b5e8f1c4d7a0b3e6f9c2d5a8b1e4f7c0d3e6f9
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Allowed Frontend Origins (Comma-separated)
CORS_ORIGINS=https://maidproject.app,https://admin.maidproject.app

# Firebase Admin SDK Configuration (Phone OTP & Push Notifications)
FIREBASE_PROJECT_ID=maidproject-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-prod@maidproject-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Razorpay Payment Gateway Keys
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX

# Cloudinary Media CDN Keys
CLOUDINARY_CLOUD_NAME=maidproject-cdn
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXX

# Google Maps API Key (Server-side Geocoding & Distance Matrix)
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Rate Limiting & Cookies
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=20
REFRESH_TOKEN_COOKIE_NAME=refreshToken
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
LOG_LEVEL=info
```

### Frontend (`frontend/.env`)

```ini
VITE_API_BASE_URL=https://api.maidproject.app/api/v1
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXX
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=maidproject-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=maidproject-prod
```

### Admin (`admin/.env`)

```ini
VITE_API_BASE_URL=https://api.maidproject.app/api/v1
```

---

## 2. Option A: Deployment on Ubuntu VPS (Docker + Nginx Reverse Proxy)

### Step 1: Server Initialization
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 nginx git
sudo systemctl enable --now docker nginx
```

### Step 2: Clone Monorepo & Setup `.env`
```bash
git clone https://github.com/your-org/maidproject.git /var/www/maidproject
cd /var/www/maidproject

# Setup production environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
# (Edit .env files with actual production secrets)
```

### Step 3: Launch Containers via Docker Compose
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Step 4: Configure Nginx SSL & Reverse Proxy
Copy `backend/nginx.conf` or configure `/etc/nginx/sites-available/maidproject`:
```nginx
server {
    server_name maidproject.app www.maidproject.app;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name admin.maidproject.app;

    location / {
        proxy_pass http://127.0.0.1:5174;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name api.maidproject.app;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
Obtain Let's Encrypt SSL:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d maidproject.app -d admin.maidproject.app -d api.maidproject.app
```

---

## 3. Option B: Deployment on Render / Railway / Vercel

### MongoDB Atlas Setup
1. Create a MongoDB Atlas Cluster (Shared or Dedicated).
2. Go to **Network Access** and add `0.0.0.0/0` or the static outbound IP addresses of your hosting provider.
3. Go to **Database Access**, create a user with read/write roles, and copy the Connection String.

### Render.com (Backend API)
1. Create a new **Web Service** on Render connected to your Git repo.
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `node dist/server.js`
5. Add all environment variables from `backend/.env`.

### Vercel (Customer Frontend & Admin Dashboard)
1. Import Git repository into Vercel.
2. Framework Preset: **Vite**.
3. **Frontend Project**: Root Directory `frontend`, Build Command `npm run build`, Output Directory `dist`.
4. **Admin Project**: Root Directory `admin`, Build Command `npm run build`, Output Directory `dist`.
5. Set `VITE_API_BASE_URL` in environment variable settings for both projects.

---

## 4. Pre-Flight Production Checklist

- [ ] All `.env` secrets updated with production credentials.
- [ ] MongoDB Atlas indexes applied and verified.
- [ ] CORS origins restricted to exact production domain names.
- [ ] Cookie attributes set to `Secure: true` and `SameSite: lax`.
- [ ] HTTPS Certificate (SSL) active on all subdomains.
- [ ] Razorpay webhook URL configured to `https://api.maidproject.app/api/v1/payments/webhook`.
- [ ] Firebase project authorized domain configured under Firebase Console Auth settings.

---

## 5. Remaining Manual External Integrations

1. **Firebase Admin SDK Key**: Download JSON key from Firebase Console -> Project Settings -> Service Accounts, copy private key string.
2. **Razorpay Production API Keys**: Toggle to Live Mode in Razorpay Dashboard and copy Key ID & Secret.
3. **Google Maps API Key**: Restrict API key to production HTTP referrers (`*.maidproject.app`).
4. **Cloudinary CDN Credentials**: Copy Cloud Name, API Key, and Secret from Cloudinary Dashboard.
