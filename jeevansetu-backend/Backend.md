# Backend Documentation – JeevanSetu

## 1. Overview

The backend is an Express + MongoDB (Mongoose) API powering JeevanSetu’s donor/recipient flows. It exposes authentication, request management, and donation history endpoints, handles OTP email delivery, and issues both access/refresh JWT tokens.

## 2. Tech stack & dependencies

- Runtime: Node.js 18+
- Framework: Express 4
- Database: MongoDB via Mongoose 8
- Auth: jsonwebtoken (access + refresh tokens)
- Validation & Security: express-validator, helmet, cors, cookie-parser
- Utilities: bcryptjs, morgan, nodemailer, dotenv

## 3. Project structure

```text
jeevansetu-backend/
├─ package.json
└─ src/
   ├─ config/            # db.js (Mongoose connection), env loaders
   ├─ controllers/       # authController.js, requestController.js, donationController.js
   ├─ middleware/        # auth/protect middleware, error handlers
   ├─ models/            # User.js, Request.js, Donation.js, Otp.js (if applicable)
   ├─ routes/            # authRoutes.js, requestRoutes.js, donationRoutes.js, health.js
   ├─ utils/             # sendEmail.js, token helpers, logger utilities
   └─ server.js          # Express bootstrap and CORS configuration
```

## 4. Environment variables

Create `jeevansetu-backend/.env` using the template below. All secrets are required for production; for local testing, dummy values work if email sending is mocked.

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/jeevansetu
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_key
CLIENT_URL=http://localhost:5173
```

## 5. Scripts & local run

```bash
cd jeevansetu-backend
npm install
npm run dev    # nodemon server.js
```

Ensure MongoDB is running locally or update `MONGO_URI` to point to Atlas.

## 6. Authentication flow

1. **Register (`POST /api/auth/register`)** – hashes password, stores user, returns access token; refresh token set via HttpOnly cookie.
2. **Login (`POST /api/auth/login`)** – verifies credentials, issues new tokens.
3. **Protected routes** – `protect` middleware reads `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, and attaches `req.user`.
4. **Refresh token** – `POST /api/auth/refresh-token` reads the HttpOnly cookie, validates via `JWT_REFRESH_SECRET`, and rotates tokens.
5. **Logout** – `POST /api/auth/logout` clears refresh cookie.

Tokens use short-lived access (e.g., 15m) and longer refresh (e.g., 7d) windows. Revocation is handled by deleting/rotating refresh cookies.

## 7. API surface

Base URL: `http://localhost:3000/api`

| Area      | Endpoints                                                                                                                            | Notes                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Health    | `GET /health`                                                                                                                        | Basic uptime probe                                                                                        |
| Auth      | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`, `PUT /auth/profile`, `POST /auth/refresh-token`, `POST /auth/logout` | `PUT /auth/profile` accepts personal info, address, socials, availability toggles                         |
| Requests  | `POST /requests`, `GET /requests`, `POST /requests/:id/match`, `PATCH /requests/:id/status`                                          | Status transitions: `open → matched → fulfilled/cancelled` (or reopen to `open`)                          |
| Donations | `POST /donations`, `GET /donations/me`                                                                                               | `GET /donations/me` filters by donor id; `POST /donations` also used internally when request is fulfilled |

Validation highlights:

- Blood group enum: `A+, A-, B+, B-, AB+, AB-, O+, O-`
- Phone numbers validated as 10-digit strings (server enforces pattern via express-validator)
- Social URLs must point to instagram.com, x.com, or facebook.com

## 8. Data models (summary)

- **User**: core identity (name, email, password hash, role), bloodGroup, availability, contact info, address, social handles, `donationHistory[]`, `lastDonationAt`.
- **Request**: patientName, hospitalName, quantity, bloodGroup, urgencyLevel, location, coordinates, neededBy, status, `requestedBy`, `matchedDonor`.
- **Donation**: `donor`, `recipient`, `request`, bloodGroup, quantityDonated, dateOfDonation, location, status, notes. Created automatically when matched requests are marked fulfilled.

## 9. Services & utilities

- `utils/sendEmail.js`: nodemailer transporter for OTP/notification emails. Wraps HTML templates and reuses environment credentials.
- `utils/generateTokens.js` (or equivalent): creates access & refresh tokens and sets cookies.
- `middleware/protect.js`: verifies JWT, attaches `req.userId`, handles expired/invalid tokens gracefully.

## 10. Testing guidelines

- Use the sample accounts defined in the root README to seed donors and recipients before integration testing.
- For API-level verification, import a Postman collection with the endpoints above and set environment variables (`BASE_URL`, `ACCESS_TOKEN`).
- Exercise critical flows:
  1. Register donor + recipient.
  2. Create request (`POST /requests`).
  3. Match request as donor (`POST /requests/:id/match`).
  4. Fulfill request (`PATCH /requests/:id/status` with `status=fulfilled`) and confirm a Donation record is created.
  5. Fetch `/donations/me` to ensure new donation appears.
- Test error handling by submitting invalid blood groups or missing required fields; server should return `400` with validation errors.

## 11. Deployment considerations

- Set `NODE_ENV=production`, use secure cookies (`Secure`, `SameSite=None`) when serving over HTTPS.
- Configure CORS to allow the deployed frontend origin.
- Use a managed MongoDB instance (e.g., Atlas) with IP allowlists.
- Store secrets (JWT, email credentials) in the hosting provider’s secret manager.

This backend document stays in sync with the main README; update both if endpoints or flows change.
