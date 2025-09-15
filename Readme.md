# JeevanSetu Backend 

# Installation Setup :- 

1. Clone the repository 
2. Navigate to the project directory 
3. Install dependencies using npm install 
4. Set up environment variables 
5. Start the server using npm start 


# Dependencies 

Core server: express

Database: mongoose

Environment vars: dotenv

Security: helmet, cors

Logging: morgan

Dev tools: nodemon (dev only)


npm install express mongoose dotenv cors body-parser jsonwebtoken bcryptjs nodemailer axios dotenv



package name: (jeevansetu-backend) jeevansetu-package
version: (1.0.0)                                                                                                          
description: "JeevanSetu - Our Minor College Project(FSWD)"
entry point: (index.js) server.js                                                                                         
test command:                                                                                                             
git repository:                                                                                                           
keywords: blood-donation,healthcare , emergency, nodejs , expressjs, Full stack web developement
author: Madhav P madhavp2023@gmail.com
license: (ISC) (MIT)
type: (commonjs)                                                                                                          
About to write to E:\JeevanSetu – Real-Time Blood & Plasma Donor App\jeevansetu-backend\package.json:

npm init :- 


{
  "name": "jeevansetu-package",
  "version": "1.0.0",
  "description": "\"JeevanSetu - Our Minor College Project(FSWD)\"",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "blood-donation",
    "healthcare",
    "emergency",
    "nodejs",
    "expressjs",
    "Full",
    "stack",
    "web",
    "developement"
  ],
  "author": "Madhav P madhavp2023@gmail.com",
  "license": "(MIT)",
  "type": "commonjs"
}


Is this OK? (yes) yes



express@4 - Web framework (you chose stable version - smart!)
mongoose - MongoDB object modeling
dotenv - Environment variables management
cors - Cross-origin resource sharing (for frontend-backend communication)
helmet - Security middleware
morgan - HTTP request logger


npm install -D nodemon :- Why nodemon? It automatically restarts your server when you make changes - huge time saver during development!




npm install bcryptjs jsonwebtoken express-validator

Install cookie parser: run in backend folder:
npm i cookie-parser



npm create vite@latest jeevansetu-frontend -- --template react

cd jeevansetu-frontend

npm install


Old setup  of Tailwind CSS :- 

Option B: Tailwind v3 (classic config)
Only do this if you prefer the old setup.

Install:
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
Add to tailwind.config.js:
content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]
Replace @import "tailwindcss"; with:
In 
src/index.css
:
@tailwind base;
@tailwind components;
@tailwind utilities;
Run: npm run dev



New Setup of Tailwind CSS :- (Adopted here) :- 

npm i -D tailwindcss@latest postcss@latest autoprefixer@latest
npx tailwindcss@latest init -p

Add to tailwind.config.js:
content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]

or :- 

just :- npm i -D tailwindcss @tailwindcss/vite

Add to vite.config.js:
import tailwindcss from "@tailwindcss/vite";
export default {
  plugins: [tailwindcss()],
}

Core libraries for React.js Frontend Setup (install now) :- 

react-router-dom — routing
axios — HTTP client (we’ll set withCredentials)
react-hook-form — forms
zod + @hookform/resolvers — schema validation
react-hot-toast — lightweight toasts
react-icons — icons

npm i react-router-dom axios react-hook-form zod @hookform/resolvers react-hot-toast react-icons

npm install react-slick slick-carousel --save

---

# JeevanSetu – Project Overview and Roadmap

## 1) What we are building
JeevanSetu is a MERN-based, real-time Blood and Plasma donor application. Donors and recipients can register, manage their profiles, and connect quickly. This README documents the architecture, how to run locally, API surface, data models, and our feature roadmap (starting with the Dashboard).

## 2) Tech Stack
- Backend: Node.js (ESM), Express, MongoDB (Mongoose)
- Auth: JWT (access token), HttpOnly cookie (refresh token)
- Security/Middleware: helmet, cors, cookie-parser, morgan
- Frontend: React + Vite, Tailwind theme (dark red/rose), react-hook-form, axios

## 3) Monorepo layout
```
root/
├─ jeevansetu-backend/
│  ├─ src/
│  │  ├─ config/            # DB connection, env load
│  │  ├─ controllers/       # Route controllers (authController.js, etc.)
│  │  ├─ middleware/        # protect (JWT) middleware
│  │  ├─ models/            # Mongoose models (User.js, Request.js, Donation.js)
│  │  ├─ routes/            # Express routers (authRoutes.js, health.js)
│  │  ├─ utils/             # generateTokens.js
│  │  └─ server.js          # Express app bootstrap
│  └─ package.json          # "type":"module"
└─ jeevansetu-frontend/
   ├─ src/
   │  ├─ components/        # Reusable UI and guards
   │  ├─ hooks/             # useAuth, etc.
   │  ├─ lib/               # api client, auth helpers
   │  ├─ pages/             # Login, Register, Dashboard
   │  └─ main.jsx/App.jsx   # App entry
   └─ package.json
```

## 4) Environment setup
Create `jeevansetu-backend/.env`:
```
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/jeevansetu
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```
Frontend dev server runs on port 5173 by default.

## 5) Run locally
- Backend
  - cd jeevansetu-backend
  - npm install
  - npm run dev
- Frontend
  - cd jeevansetu-frontend
  - npm install
  - npm run dev

Ensure CORS allows http://localhost:5173 in `src/server.js`.

## 6) Data models (summary)

### User (src/models/User.js)
- Core: name, email (unique), password (hashed), role ('donor'|'recipient'), bloodGroup (enum), available (boolean)
- Contact: country, state, city, phone, message
- Profile: address (object) with `line1` (we map single "address" string into `address.line1`), optional `line2`, `postalCode`
- Social: `social.instagram`, `social.x`, `social.facebook` (domain-validated URLs)
- History: lastDonationAt (Date), donationHistory ([])

### Request / Donation (placeholders)
- Request.js and Donation.js exist for future flows (requests between recipients and donors, donation records). We will iterate here after Dashboard completion.

## 7) Auth flow
1. Register: `POST /api/auth/register`
   - Returns `data.user` and `accessToken`. Sets `refreshToken` in HttpOnly cookie.
2. Login: `POST /api/auth/login`
   - Returns `data.user` and `accessToken`. Sets `refreshToken` cookie.
3. Authenticated calls:
   - Frontend sends `Authorization: Bearer <accessToken>`.
   - Middleware `protect` reads and verifies JWT (`JWT_SECRET`), attaches `req.userId`.
4. Refresh token: `POST /api/auth/refresh-token`
   - Reads refresh cookie, returns new `accessToken` and rotates cookie.
5. Logout: `POST /api/auth/logout`
   - Clears refresh cookie.

## 8) API surface (current)

Base: `http://localhost:3000/api`

### Health
- `GET /health` – sanity probe

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile` – protected; returns full user profile including `address` and `social`
- `PUT /auth/profile` – protected; partial updates. Accepts any subset of:
  - Personal: `name`, `phone`, `city`, `state`, `country`, `message`, `available`, `bloodGroup`
  - Address: `address` (single string mapped to `address.line1`), and legacy fields `addressLine1`, `addressLine2`, `postalCode`
  - Social: `instagram`, `x`, `facebook`
- `POST /auth/refresh-token`
- `POST /auth/logout`

Validation highlights
- `bloodGroup` must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-
- `phone` must be 10 digits if provided
- Social links must be full URLs to instagram.com, x.com, facebook.com

## 9) Frontend app
- Login page (`src/pages/Login.jsx`): uses shared api client, stores access token, redirects to intended route or `/dashboard`.
- Register page (`src/pages/Register.jsx`): single `address` field; sends only provided fields.
- Dashboard (`src/pages/Dashboard.jsx`):
  - Personal Information card complete.
  - Social Links rendered and clickable.
  - Address uses `profile.address.line1` (and shows `postalCode` if present).
  - Status card next (see roadmap below).

## 10) Dashboard roadmap (incremental plan)

Milestone M1 – Status Card (High priority)
- Availability toggle with optimistic update (`PUT /auth/profile { available }`).
- Last donation quick-set (date picker + save; `PUT /auth/profile { lastDonationAt }`).
- Timestamps polish (updatedAt, relative time tooltip).

Milestone M2 – Quick Actions (High priority)
- Edit Profile modal (name, phone, message, address, social); client validation; optimistic UI; success/error toasts.
- Toggle Availability (duplicate control for convenience).
- Copy Donor ID; Refresh; Logout.

Milestone M3 – Donation History (Medium)
- Empty state with CTA "Record donation".
- Optional add entry (UI first, backend later if needed).
- Relative time and better formatting.

Milestone M4 – Polish (Medium)
- Loading skeletons for Personal/Status cards.
- Toasts (success/error) consistent with dark red/rose theme.
- Accessibility pass (labels, aria-attrs).

## 11) Coding standards and conventions
- Backend uses ESM (`"type":"module"`). All exports are top-level (avoid nested `export`).
- Controllers return consistent JSON: `{ success, data: { ... } }`.
- Only send changed fields in update calls.
- Keep imports at the top of files.

## 12) Troubleshooting
- `Unexpected token 'export'` in Node: ensure the previous function is closed with `};` before the next `export`.
- 401 Unauthorized in Postman: ensure Authorization uses a defined variable (e.g., `{{accessToken}}`), token not expired, and route method matches (e.g., `PUT /auth/profile`).

---

This README will evolve with each milestone. The near-term focus is completing the Dashboard per the roadmap above.