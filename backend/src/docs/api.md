# API Documentation — v1

Base URL: `/api/v1`

All responses follow this envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": { "field": ["validation error"] }
}
```

---

## Health

### `GET /health`

Check API availability.

**Response `200`**

```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-07-28T10:00:00.000Z"
  }
}
```

---

## Authentication

Auth routes are rate-limited separately. Refresh tokens are set as `httpOnly` cookies on `/api/v1/auth`.

### `POST /auth/register`

Register a new customer account.

**Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Full name (2–100 chars) |
| email | string | yes | Valid email |
| phone | string | yes | E.164 format (e.g. `+919876543210`) |
| password | string | yes | Min 8 chars, upper + lower + number |

**Response `201`** — user object + tokens

---

### `POST /auth/login`

Login with email and password.

**Body**

| Field | Type | Required |
|-------|------|----------|
| email | string | yes |
| password | string | yes |

**Response `200`** — user object + tokens

---

### `POST /auth/send-otp`

Validate phone number and acknowledge OTP flow. The client must use the Firebase SDK to send the OTP.

**Body**

| Field | Type | Required |
|-------|------|----------|
| phone | string | yes |

**Response `200`**

```json
{
  "success": true,
  "message": "OTP initiation acknowledged...",
  "data": { "phone": "+919876543210" }
}
```

---

### `POST /auth/verify-otp`

Verify Firebase ID token after client-side OTP verification. Marks phone as verified and returns auth tokens.

**Body**

| Field | Type | Required |
|-------|------|----------|
| idToken | string | yes | Firebase ID token |
| phone | string | yes | Must match token phone |

**Response `200`** — user object + tokens

---

### `POST /auth/refresh-token`

Rotate refresh token and issue new access + refresh tokens.

**Body** (optional if cookie is set)

| Field | Type | Required |
|-------|------|----------|
| refreshToken | string | no |

**Response `200`** — user object + tokens

---

### `POST /auth/logout`

Revoke refresh token and clear cookie.

**Body** (optional if cookie is set)

| Field | Type | Required |
|-------|------|----------|
| refreshToken | string | no |

**Response `200`**

---

## Users

All user routes require `Authorization: Bearer <access_token>`.

### `GET /users/profile`

Get authenticated user's profile.

**Response `200`**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": { "user": { ... } }
}
```

---

### `PATCH /users/profile`

Update authenticated user's profile.

**Body** (at least one field required)

| Field | Type | Required |
|-------|------|----------|
| name | string | no |
| avatar | string (URL) | no |
| address | object | no |

**Address object**

| Field | Type | Required |
|-------|------|----------|
| street | string | yes |
| city | string | yes |
| state | string | yes |
| pincode | string | yes (6 digits) |
| country | string | no (default: India) |
| coordinates | { lat, lng } | no |

**Response `200`** — updated user object

---

## Roles

| Role | Value | Description |
|------|-------|-------------|
| Customer | `customer` | Default self-registration role |
| Cook | `cook` | Service provider |
| Admin | `admin` | Platform administrator |

Use `authorize()` middleware to restrict routes by role.

---

## Security

- Helmet security headers
- CORS with configurable origins
- Global + auth-specific rate limiting
- Zod request validation
- JWT access tokens (short-lived) + refresh tokens (stored hashed in DB)
- Firebase Admin SDK for OTP token verification
- Winston structured logging + Morgan HTTP logging
