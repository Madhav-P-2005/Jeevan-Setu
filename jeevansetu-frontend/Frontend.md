# Frontend Documentation – JeevanSetu

## 1. Overview

The frontend is a Vite-powered React SPA styled with Tailwind CSS. It implements onboarding (Home, Login, Register, Verify Email, Forgot/Reset Password) and an authenticated dashboard for donors and recipients with KPI cards, request/donation management, and themed toast notifications.

## 2. Tech stack & key libraries

- React 18 + Vite
- Routing: `react-router-dom`
- Forms & validation: `react-hook-form`
- Network: `axios` (preconfigured instance with `withCredentials`)
- UI/animation: Tailwind CSS, `react-icons`, `framer-motion`
- Notifications: custom wrapper over `react-toastify`

## 3. Directory structure

```text
jeevansetu-frontend/
├─ package.json
└─ src/
   ├─ assets/                  # logos, illustrations
   ├─ components/
   │  ├─ dashboard/            # DonorMatches, RecipientRequests, stats cards
   │  └─ layout/               # Navbar, Footer, ProtectedRoute
   ├─ hooks/                   # useAuth, useRequests, useDonationHistory
   ├─ lib/                     # api.js (axios), toast.jsx, helpers
   ├─ pages/
   │  ├─ Home.jsx
   │  ├─ Login.jsx
   │  ├─ Register.jsx
   │  ├─ VerifyEmail.jsx
   │  ├─ ForgotPassword.jsx
   │  ├─ ResetPassword.jsx
   │  └─ Dashboard.jsx
   ├─ router/                  # route definitions (if applicable)
   ├─ App.jsx / main.jsx       # SPA entry
   └─ styles/ (Tailwind config via Vite plugin)
```

## 4. Styling system & theming

- Tailwind CSS configured via `@tailwindcss/vite` plugin; global styles defined in `src/index.css`.
- Theme references a deep red / plasma palette (`bg-slate-950`, `text-rose-200`, gradient accents) for consistency across pages.
- Components use utility classes with glassmorphism cards, soft shadows, and subtle blur.
- Toast notifications use a custom `MotionToast` component (`src/lib/toast.jsx`) combining react-toastify + framer-motion transitions.

## 5. Routing and navigation

- Public routes: `/` (Home), `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`.
- Dashboard: `/dashboard` (or `/profile` in legacy) behind auth guard. `ProtectedRoute` verifies access token before rendering.
- Home hero CTA links append `?role=donor` or `?role=recipient` so Register pre-selects the role via `useSearchParams`.

## 6. Pages & features

### Home

- Hero with mission statement, stats, CTA buttons directing to register with role query params.
- Highlights of donor-recipient flow.

### Auth pages

- **Login**: `react-hook-form`, API call to `/auth/login`, stores token, handles verification redirect.
- **Register**: multi-field form (name, email, password confirmation, contact info, role, blood group). Reads `role` from query string, displays inline errors, and triggers OTP verification.
- **VerifyEmail**: OTP submission/resend logic, uses `toast` for feedback.
- **ForgotPassword / ResetPassword**: OTP-based reset flow with query params for email.

### Dashboard

- Shared layout with Navbar + sidebar (if implemented) and cards.
- **Donor view**: availability toggle, quick stats (next eligibility, total donations), DonorMatches card list with requester info and CTA buttons, donation history timeline using `useDonationHistory` hook.
- **Recipient view**: create new request form, grouped status lists (Open, Matched, Fulfilled, Cancelled), matched donor contact details, action buttons for status changes.
- Toasts confirm actions like matching, fulfilling, cancelling, logout.

## 7. State management & hooks

- `useAuth` (if present): handles user info, token refresh, logout.
- `useRequests`: fetches and formats request lists for dashboard components (grouping, computed fields).
- `useDonationHistory`: fetches `/donations/me`, exposes loading/error states and a `refresh` method.
- Local component state is managed with `useState`/`useEffect`; forms depend on `useForm`.

## 8. API integration

- `src/lib/api.js` configures axios base URL (`/api`) with `withCredentials: true` so refresh-token cookies are sent automatically.
- Interceptors (if added) can handle 401 responses by attempting refresh.
- Each page/component imports API helpers or calls axios directly, wrapping calls with toast notifications.

## 9. Testing checklist (frontend)

1. Run `npm run dev` and ensure Vite serves app on `http://localhost:5173`.
2. Walk through registration for donor and recipient accounts using the sample data from the root README. Verify OTP screens and redirect to dashboard.
3. Test login/logout, availability toggles, request creation, matching, fulfillment, and donation history refresh.
4. Validate forgot/reset password flow using spare accounts.
5. Resize viewport / test on mobile emulator to confirm responsive layout (Tailwind breakpoints).
6. Confirm toasts and modal states behave correctly for both success and error scenarios.

## 10. Build & deploy

- Production build: `npm run build` (generates `/dist`).
- Preview: `npm run preview`.
- Deploy via static hosting (Vercel, Netlify) with backend origin set via environment variable (e.g., `VITE_API_URL`). Ensure CORS on backend allows deployed domain.

Keep this document aligned with UI changes. When new pages/components are added, update the relevant sections above.
