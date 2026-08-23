# MediStock Frontend (React + Vite + Tailwind)

Frontend for the MediStock Medical Inventory Management Platform.

## Run locally

```bash
npm install
cp .env.example .env   # then edit VITE_API_BASE_URL if needed
npm run dev
```

Runs on `http://localhost:5173` and expects the backend API at `http://localhost:8080/api` by default (see `.env.example`).

## Troubleshooting

If login or register shows an error, **read the message on the form itself first** — it distinguishes two very different problems:

- **"Can't reach the server at ..."** → the backend isn't running or isn't reachable. Go start/check the backend (see its README's Troubleshooting section). Nothing here will work until `http://localhost:8080/api/health` loads successfully in your browser.
- **Any other message** (e.g. "Invalid email or password", "An account with this email already exists") → the backend responded, so it's a real credentials/validation issue, not a connectivity one.

## Build for production

```bash
npm run build
```
Outputs static files to `dist/` — deploy to Netlify, Vercel, S3/CloudFront, or serve via Nginx.

## What's included

- **Auth**: login/register pages, JWT stored in localStorage, auto-attached to API calls, auto-redirect to login on 401, and clear network-vs-credentials error messages.
- **Dashboard**: live stats (total medicines, suppliers, low-stock, out-of-stock, expiring soon, expired, inventory value), a bar chart of inventory value by category, a pie chart of stock-status distribution, quick-glance low-stock/expiring-soon lists, and a recent stock-activity feed.
- **Medicines**: searchable/filterable table (by name, category, supplier, stock status), add/edit modal, inline stock +/- adjustment with a full per-medicine stock history view, delete (admin only), full category management (add/edit/delete).
- **Suppliers**: searchable card list, add/edit modal, delete (admin only) — deleting a supplier detaches it from medicines rather than deleting them.
- **Expiry Tracking**: a dedicated page with "Expiring Soon" (next 60 days) and "Expired" tabs, days-until/days-since badges, and a one-click "write off" action that zeroes expired stock and logs why.
- **Notifications**: a bell icon in the navbar with an unread-count badge, backed by the backend's auto-generated low-stock/out-of-stock/expiring/expired alerts (plus a daily sweep) — click to view, mark read, or mark all read.
- **Role-aware UI**: STAFF can view and adjust stock; PHARMACIST can also create/edit; ADMIN can additionally delete.

## Structure

```
src/
  api/         axios client + one module per resource (auth, medicines, suppliers, categories, dashboard, notifications)
  components/  shared UI (Navbar, NotificationBell, Modal, StatCard, Badge, BrandPanel, ProtectedRoute)
  context/     AuthContext (login/register/logout, current user)
  pages/       Login, Register, Dashboard, Medicines, Suppliers, ExpiryTracking
```

## Not yet wired up
OAuth2 social login, push/SMS notifications (Twilio/FCM), and PDF/Excel export aren't implemented yet — the API client layer is structured so they're straightforward to add against the existing backend endpoints.
