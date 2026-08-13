# Cook & Home Maid Booking Platform

Production-ready monorepo for a cook and home maid booking website.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Customer App** | React 18, Vite, TypeScript, Material UI, Redux Toolkit |
| **Admin Dashboard** | React 18, Vite, TypeScript, Material UI, MUI X Data Grid, Redux Toolkit |
| **API Server** | Node.js, Express.js, TypeScript, MongoDB (Mongoose) |
| **Auth** | JWT (access + refresh tokens), Firebase OTP (phone verification) |
| **Payments** | Razorpay |
| **Maps** | Google Maps (`@react-google-maps/api` on frontend) |
| **Media** | Cloudinary |
| **Infrastructure** | Docker, Docker Compose, Nginx |

## Repository Structure

```
cook-maid-booking/
├── frontend/                 # Customer-facing web app (port 5173)
│   ├── src/
│   │   ├── app/              # Redux store, providers, typed hooks
│   │   ├── features/         # Feature modules (auth, booking, payment, …)
│   │   ├── components/       # Shared UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── routes/           # React Router configuration
│   │   ├── services/api/     # Axios API client & endpoints
│   │   ├── theme/            # MUI theme configuration
│   │   ├── hooks/            # Shared custom hooks
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # Shared TypeScript types
│   │   └── constants/        # App-wide constants
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
├── admin/                    # Admin dashboard (port 5174)
│   ├── src/
│   │   ├── app/
│   │   ├── features/         # dashboard, bookings, users, providers, payments
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/api/
│   │   └── …
│   ├── Dockerfile
│   └── .env.example
│
├── backend/                  # REST API server (port 5000)
│   ├── src/
│   │   ├── config/           # Environment, DB, Firebase, Cloudinary, Razorpay
│   │   ├── controllers/
│   │   ├── middleware/       # auth, validation, error handling
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/v1/        # Versioned API routes
│   │   ├── services/         # Business logic & third-party integrations
│   │   │   ├── auth/
│   │   │   ├── firebase/     # OTP verification
│   │   │   ├── razorpay/     # Payments & webhooks
│   │   │   ├── cloudinary/   # Image uploads
│   │   │   └── maps/         # Geocoding helpers
│   │   ├── validators/       # Zod request schemas
│   │   ├── utils/
│   │   ├── types/
│   │   └── jobs/             # Scheduled / background tasks
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml        # Local development stack
├── docker-compose.prod.yml   # Production deployment
├── package.json              # npm workspaces root
└── .env.example              # Docker Compose overrides
```

## Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Docker** & **Docker Compose** (optional, for containerized dev)
- Accounts / API keys for:
  - [MongoDB Atlas](https://www.mongodb.com/atlas)
  - [Firebase](https://console.firebase.google.com) (Phone Auth / OTP)
  - [Razorpay](https://razorpay.com/)
  - [Google Cloud](https://console.cloud.google.com/) (Maps JavaScript API)
  - [Cloudinary](https://cloudinary.com/)

## Installation

### 1. Clone and install dependencies

```bash
git clone <repository-url> cook-maid-booking
cd cook-maid-booking
npm install
```

This installs dependencies for all workspaces (`frontend`, `admin`, `backend`) via npm workspaces.

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend (customer app)
cp frontend/.env.example frontend/.env

# Admin dashboard
cp admin/.env.example admin/.env

# Docker Compose overrides (optional)
cp .env.example .env
```

Fill in all required values in each `.env` file before running the apps.

### 3. Run locally (without Docker)

```bash
# Start all three apps concurrently
npm run dev

# Or run individually
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
npm run dev:admin      # http://localhost:5174
```

### 4. Run with Docker Compose

```bash
# Copy env files first (see step 2)
docker compose up --build

# Detached mode
docker compose up -d --build

# Production build
docker compose -f docker-compose.prod.yml up -d --build
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend, admin, and backend in parallel |
| `npm run dev:frontend` | Start customer app only |
| `npm run dev:admin` | Start admin dashboard only |
| `npm run dev:backend` | Start API server only |
| `npm run build` | Production build for all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | TypeScript check across all workspaces |

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Access token signing secret (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `FIREBASE_*` | Firebase Admin SDK credentials |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay API keys |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification |
| `CLOUDINARY_*` | Cloudinary upload credentials |
| `GOOGLE_MAPS_API_KEY` | Server-side geocoding (optional) |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_FIREBASE_*` | Firebase client SDK config (OTP) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (checkout) |

### Admin (`admin/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |

## API Conventions

- Base path: `/api/v1`
- Authentication: `Authorization: Bearer <access_token>`
- Request validation: Zod schemas in `backend/src/validators/`
- Error responses: consistent JSON envelope from error middleware

## Development Ports

| Service | Port |
|---------|------|
| Frontend (customer) | 5173 |
| Admin dashboard | 5174 |
| Backend API | 5000 |
| MongoDB (Docker) | 27017 |

## Next Steps

This scaffold provides folder structure, tooling, and configuration only. Implement in this order:

1. **Backend** — Express app bootstrap, MongoDB connection, health route, JWT auth, Firebase OTP verification
2. **Frontend** — MUI theme, Redux store, routing, Firebase OTP login, booking flow, Razorpay checkout, Google Maps
3. **Admin** — Protected admin routes, dashboard, booking/user/provider management
4. **Integrations** — Razorpay webhooks, Cloudinary uploads, rate limiting, logging

## License

Private — all rights reserved.
