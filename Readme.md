# JeevanSetu – Real-Time Blood & Plasma Donor App

**Project Overview :-
**JeevanSetu is a MERN-stack application that connects blood/plasma donors and recipients in real time. Donors and recipients register with detailed profiles, manage availability, and handle requests via a consistent, themed UI. The platform handles role-based onboarding, secure JWT authentication (access + HttpOnly refresh tokens), request management with full status tracking, donor matching, and auto-logged donation histories, giving both sides clear visibility into every step of the donation lifecycle\*\*\*\*

## Table of contents

1. [Quick start](#quick-start)
2. [Tech stack](#tech-stack)
3. [Repository structure](#repository-structure)
4. [Configuration](#configuration)
5. [Running locally](#running-locally)
6. [Core features](#core-features)
7. [Functional flow](#functional-flow)
8. [Donor–recipient relationship](#donorrecipient-relationship)
9. [API overview](#api-overview)
10. [Data models](#data-models)
11. [Frontend pages](#frontend-pages)
12. [Testing checklist](#testing-checklist)
13. [Troubleshooting](#troubleshooting)

## Quick start

```bash
git clone <repo-url>
cd "JeevanSetu – Real-Time Blood-And-Plasma Donor App"

# Backend
cd jeevansetu-backend
npm install
cp .env.example .env   # or create .env using the template below
npm run dev

# Frontend (new terminal)
cd ../jeevansetu-frontend
npm install
npm run dev
```

Open `http://localhost:5173` and make sure the backend (default `http://localhost:3000`) allows that origin via CORS.

## Tech stack

- **Frontend**: React + Vite, Tailwind CSS, react-hook-form, axios, react-icons, react-toastify, framer-motion
- **Backend**: Node.js (ESM), Express, MongoDB (Mongoose)
- **Auth**: JWT access tokens stored client-side + HttpOnly refresh tokens
- **Security & tooling**: helmet, cors, cookie-parser, morgan, nodemon

## Repository structure

```text
root/
├─ jeevansetu-backend/
│  └─ src/
│     ├─ config/        # DB connection & env loading
│     ├─ controllers/   # authController, requestController, donationController
│     ├─ middleware/    # JWT protect middleware
│     ├─ models/        # User.js, Request.js, Donation.js
│     ├─ routes/        # authRoutes.js, requestRoutes.js, donationRoutes.js, health.js
│     └─ server.js      # Express app bootstrap
└─ jeevansetu-frontend/
   └─ src/
      ├─ components/    # Dashboard widgets, layout pieces
      ├─ hooks/         # useAuth, useRequests, useDonationHistory
      ├─ lib/           # axios instance, toast wrapper
      ├─ pages/         # Home, Login, Register, VerifyEmail, Forgot/Reset, Dashboard
      └─ main.jsx       # SPA entry
```

## Configuration

Create `jeevansetu-backend/.env`:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/jeevansetu
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@example.com        # optional: for OTP mailer
EMAIL_PASS=your_email_password_or_app_key
CLIENT_URL=http://localhost:5173
```

Tailwind is preconfigured in the frontend via the Vite plugin.

## Running locally

- **Backend**

  ```bash
  cd jeevansetu-backend
  npm install
  npm run dev
  ```

- **Frontend**

  ```bash
  cd jeevansetu-frontend
  npm install
  npm run dev
  ```

## Core features

1. Role-based onboarding for donors and recipients with detailed profiles, contact info, and social links.
2. Secure authentication with JWT access tokens + HttpOnly refresh tokens.
3. Recipient request management with statuses (`open`, `matched`, `fulfilled`, `cancelled`).
4. Donor matching experience that surfaces compatible requests nearby.
5. Auto-logged donation history when a matched request is fulfilled.
6. Consistent, themed UI with animated toast notifications for every major action.

## Functional flow

1. **Register & verify** – User chooses donor or recipient role, submits profile; backend stores the `User` and issues tokens.
2. **Recipient workflow** – Create a blood/plasma `Request` (patient, hospital, blood group, urgency, location, contact). Requests start as `open`.
3. **Donor workflow** – Donor dashboard lists compatible `open` requests. Accepting one marks it `matched` and saves `matchedDonor`.
4. **Fulfillment** – Once the donation occurs, recipient marks the request `fulfilled`; backend creates a `Donation` record, updates donor `donationHistory` + `lastDonationAt`, and keeps the request history accurate.
5. **History & insights** – Donors see chronological donations; recipients see request status groups and totals.

## Sample test accounts (fresh DB reset)

When you wipe the database, recreate these six accounts to cover all flows:

| Email                         | Password            | Role                   | Notes                                          |
| ----------------------------- | ------------------- | ---------------------- | ---------------------------------------------- |
| `madhavp2023@gmail.com`       | `madhavptest1@2025` | Donor                  | Primary donor for request matching and history |
| `madhavp014@gmail.com`        | `madhavptest2@2025` | Donor                  | Secondary donor for concurrent match tests     |
| `madhavp2023@klebcahubli.com` | `madhavtest3@2025`  | Recipient              | Creates Request A (e.g., A+ blood, Hubballi)   |
| `madhavjob2025@gmail.com`     | `madhavtest4@2025`  | Recipient              | Creates Request B (e.g., O- blood, Bengaluru)  |
| `madhavjeevansetu@gmail.com`  | `madhavtest5@2025`  | Donor/Recipient (flex) | Spare account for OTP/forgot-password testing  |
| `mjeevansetu@gmail.com`       | `madhavtest6@2025`  | Donor/Recipient (flex) | Spare account for additional scenarios         |

> Tip: During registration, pass `?role=donor` or `?role=recipient` in the URL to preselect the form role.

### Registration blueprint (copy/paste data)

Use this table while re-entering data after a DB reset so every account is consistent:

| Name            | Email                         | Role      | Blood Group | Location (Country / State / City) | Contact phone     | Availability                   | Social handles               |
| --------------- | ----------------------------- | --------- | ----------- | --------------------------------- | ----------------- | ------------------------------ | ---------------------------- |
| Arjun Donor     | `madhavp2023@gmail.com`       | Donor     | A+          | India / Karnataka / Hubballi      | `+91 90001 11111` | Available                      | instagram.com/arjun.donor    |
| Meera Donor     | `madhavp014@gmail.com`        | Donor     | O-          | India / Karnataka / Bengaluru     | `+91 90002 22222` | Available                      | instagram.com/meera.donor    |
| Priya Recipient | `madhavp2023@klebcahubli.com` | Recipient | A+          | India / Karnataka / Hubballi      | `+91 90003 33333` | n/a                            | x.com/priya.recipient        |
| Ravi Recipient  | `madhavjob2025@gmail.com`     | Recipient | O-          | India / Karnataka / Bengaluru     | `+91 90004 44444` | n/a                            | instagram.com/ravi.recipient |
| Spare Account 1 | `madhavjeevansetu@gmail.com`  | Donor     | B+          | India / Maharashtra / Pune        | `+91 90005 55555` | Unavailable (toggle for tests) | facebook.com/spare.one       |
| Spare Account 2 | `mjeevansetu@gmail.com`       | Recipient | AB+         | India / Goa / Panaji              | `+91 90006 66666` | n/a                            | x.com/spare.two              |

Feel free to tweak names/phones, but keep blood groups diversified to test compatibility filters.

## End-to-end test playbook

Follow this scripted flow after creating the accounts above:

1. **Login sanity**

   - Sign in as each user to confirm credentials and that dashboards load without errors.

2. **Recipient setup**

   - `madhavp2023@klebcahubli.com`: create Request A (blood group A+, urgency High, Hubballi hospital). Ensure it appears under **Open**.
   - `madhavjob2025@gmail.com`: create Request B (blood group O-, urgency Medium, Bengaluru). Verify toast + listing.

3. **Donor matching**

   - `madhavp2023@gmail.com`: from donor dashboard, filter to A+ and match Request A. Confirm toast success and request moves to **Matched** on recipient side.
   - `madhavp014@gmail.com`: match Request B similarly.

4. **Fulfillment and donation logging**

   - Recipients mark their matched requests as **Fulfilled**.
   - Backend auto-creates `Donation` entries; check each donor’s Donation History to confirm new rows with correct details (blood group, quantity, location, date).

5. **Status regression**

   - From recipient cards, toggle statuses back to **Open** and **Cancelled** to ensure transitions and toasts remain correct.

6. **Availability & profile updates**

   - Donors toggle availability on/off and update contact info/social links; ensure validations trigger for invalid inputs.

7. **Auth edge cases**

   - Use spare accounts for Forgot Password → OTP email → Reset Password; confirm login with the new password works.
   - Test logout/login loops and refresh-token flow by letting the access token expire (or clearing local storage) and calling protected endpoints.

8. **Final verification**
   - Confirm recipients see accurate counts in quick stats, and donors’ donation histories stay in sync after refresh.

### Detailed scenario walkthroughs

#### Scenario A – Priya Recipient & Arjun Donor

1. Register Priya (A+ recipient) and Arjun (A+ donor) using the blueprint above.
2. Priya creates Request A with:
   - Patient: "Riya Kulkarni" · Hospital: "KIMS Hubballi" · Quantity: 2 units · Needed By: +3 days · Urgency: High · Location: Hubballi.
3. Arjun signs in, keeps availability toggled on, filters to blood group A+, matches Request A.
4. Priya sees donor info populate; after coordinating offline, she marks the request **Fulfilled**.
5. Verify Donation History entry for Arjun now shows Riya’s request with today’s date, location Hubballi, quantity 2 units.

#### Scenario B – Ravi Recipient & Meera Donor

1. Ravi (O- recipient) creates Request B with Patient "Ananya Rao" at "Fortis Bengaluru", quantity 3 units, urgency Medium.
2. Meera (O- donor) matches the request, then Ravi marks it **Cancelled** to test status regression, reopens it, and finally marks **Fulfilled**.
3. Confirm Donation History for Meera logs only the final fulfillment entry, and Ravi’s quick stats reflect total fulfilled/cancelled counts.

#### Scenario C – OTP / Forgot Password

1. On the Login page, click **Forgot Password**, submit `madhavjeevansetu@gmail.com`.
2. Check mocked email/console log for OTP, go to Reset Password page, enter OTP + new password.
3. Log in with the new password and ensure dashboard loads; attempt with old password to confirm it fails.

#### Scenario D – Refresh token & timeout

1. Log in as `mjeevansetu@gmail.com`, leave the dashboard idle until the access token expires (or manually clear local storage token).
2. Trigger an API call (e.g., refresh personal info card) to confirm the app silently refreshes tokens via `/auth/refresh-token` and stays on the page.

## Donor–recipient relationship

- A **Recipient** can create multiple **Requests** (`requestedBy`).
- A **Donor** can match multiple Requests (`matchedDonor`).
- When a matched Request is fulfilled, a **Donation** links Donor ↔ Recipient ↔ Request.
- Donor records maintain `donationHistory[]` of Donation IDs; recipients can trace every fulfilled request through its linked donation.

This triad keeps data normalized while preserving end-to-end traceability.

## API overview

Base URL: `http://localhost:3000/api`

- **Auth**: `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`, `PUT /auth/profile`, `POST /auth/refresh-token`, `POST /auth/logout`
- **Requests**: `POST /requests`, `GET /requests`, `POST /requests/:id/match`, `PATCH /requests/:id/status`
- **Donations**: `POST /donations`, `GET /donations/me`
- **Health**: `GET /health`

Validation enforces legal blood groups (A+/–, B+/–, AB+/–, O+/–), 10-digit phone numbers, and proper Instagram/X/Facebook URLs.

## Data models

- **User** – `name`, `email`, `password`, `role`, `bloodGroup`, `available`, `country`, `state`, `city`, `phone`, `message`, `address`, `social`, `donationHistory[]`, `lastDonationAt`.
- **Request** – `requestedBy`, `patientName`, `hospitalName`, `contactPhone`, `location`, `bloodGroup`, `urgencyLevel`, `quantity`, `neededBy`, `status`, `matchedDonor`.
- **Donation** – `donor`, `recipient`, `request`, `bloodGroup`, `quantityDonated`, `dateOfDonation`, `location`, `status`, `notes`.

## Frontend pages

- **Home** – Marketing hero with role-based CTAs linking to `/register?role=donor|recipient`.
- **Auth pages** – Login, Register, Verify Email, Forgot Password, Reset Password with unified blood/plasma theme and toast feedback.
- **Dashboard**
  - Donor: availability toggle, quick stats, compatible request feed, donation history.
  - Recipient: create/manage requests, status-grouped lists, matched donor info, quick stats.

## Testing checklist

1. Register donor and recipient; verify email/OTP flow.
2. Recipient creates a request → appears under `Open` and in donor feed.
3. Donor matches the request → recipient view shows `Matched` with donor info.
4. Recipient marks request `fulfilled` → donation history entry appears for donor.
5. Exercise forgot/reset password flow (OTP email and reset confirmation).
6. Toggle donor availability and update profile fields; confirm validations and toasts.

## Troubleshooting

- **JWT 401s** – Ensure `Authorization: Bearer <accessToken>` header is sent; call `/auth/refresh-token` if expired.
- **CORS errors** – Align `CLIENT_URL` in backend `.env` with the frontend origin.
- **Mongo connection issues** – Check `MONGO_URI` and that MongoDB service is running.
- **Frontend build problems** – Clear `node_modules` and reinstall if Vite hot reload or Tailwind compilation fails.

This README gives newcomers everything they need to clone, configure, run, and understand the donor–recipient flow end-to-end.
