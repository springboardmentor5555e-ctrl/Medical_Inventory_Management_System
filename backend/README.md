# MediStock Backend (Spring Boot)

REST API for the MediStock Medical Inventory Management Platform.

## Tech
Java 17, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA, H2 (dev) / MySQL / PostgreSQL (prod), Maven.

## Run locally

```bash
mvn spring-boot:run
```

Runs on `http://localhost:8080` using a file-based H2 database by default — no setup needed, and **your data survives backend restarts** (stored in `./data/medistock.mv.db`, created automatically the first time you run the app). To wipe all data and start fresh, stop the app and delete the `data/` folder.

H2 console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/medistock`, user `sa`, no password).

No default account is seeded. Create your first user via `POST /api/auth/register` (set `"role": "ADMIN"` in the request body for an administrator account), or through the **Register** page in the frontend — only the first time. After that, always use the **Login** page to sign back in; hitting Register again with an email you've already used will correctly tell you it's taken (that's not a login failure, it's the register check working as intended).

**Sample data:** on first run (empty database only — never duplicates on restart), 5 sample medicines are seeded across 2 suppliers and 5 categories, with a combined inventory value of exactly **₹5,000**, so the dashboard and search/filter have something to show right away. Delete the `data/` folder and restart to reset and re-seed.

## Switch database

- **Local MySQL**: edit `src/main/resources/application-dev.properties`, uncomment the MySQL block, comment out H2.
- **Production PostgreSQL**: set `spring.profiles.active=prod` and provide env vars `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`.

## Build a jar

```bash
mvn clean package
java -jar target/medistock-backend.jar
```

## Key API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user (role: ADMIN/PHARMACIST/STAFF) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET/POST | `/api/medicines` | List (search/filter via query params) / create medicine |
| GET/PUT/DELETE | `/api/medicines/{id}` | Get / update / delete a medicine |
| PATCH | `/api/medicines/{id}/stock` | Adjust stock (+/-), logs a stock movement, triggers alerts |
| GET | `/api/medicines/{id}/stock-history` | Stock movement log for a medicine |
| GET | `/api/medicines/alerts/low-stock` | Low-stock medicines |
| GET | `/api/medicines/alerts/expiring-soon` | Medicines expiring soon |
| GET | `/api/medicines/alerts/expired` | Expired medicines |
| GET | `/api/stock-logs/recent` | Cross-inventory recent stock movement feed |
| GET/POST | `/api/suppliers` | List / create suppliers |
| GET/PUT/DELETE | `/api/suppliers/{id}` | Get / update / delete a supplier (deleting detaches it from medicines, does not delete them) |
| GET/POST | `/api/categories` | List / create categories |
| PUT/DELETE | `/api/categories/{id}` | Update / delete a category (deleting detaches it from medicines, does not touch their data) |
| GET | `/api/dashboard/summary` | Aggregate stats for dashboards |
| GET | `/api/dashboard/analytics/by-category` | Inventory value/quantity per category, for charts |
| GET | `/api/dashboard/analytics/stock-status` | In-stock / low / out-of-stock / expired breakdown, for charts |
| GET/PATCH | `/api/notifications` | List notifications (`?unreadOnly=true` to filter) / mark one read |
| GET | `/api/notifications/unread-count` | Unread notification count (for a navbar badge) |
| POST | `/api/notifications/mark-all-read` | Mark every notification read |
| GET | `/api/health` | Unauthenticated health check |

All endpoints except `/api/auth/**` and `/api/health` require `Authorization: Bearer <token>`.

## Search & filter query params on `/api/medicines`
`name`, `categoryId`, `supplierId`, `batchNumber`, `stockStatus` (`LOW_STOCK` | `OUT_OF_STOCK` | `EXPIRED`), `expiryBefore` (ISO date).

## Notifications & scheduled alerts

Whenever a medicine is created, edited, or has its stock adjusted, the backend immediately checks it for low-stock / out-of-stock / expiring-soon / expired conditions and creates an in-app `Notification` if one doesn't already exist (unread) for that medicine + alert type — so alerts never pile up as duplicates.

A scheduled sweep also runs across the entire inventory once a day at 06:00, plus once ~15 seconds after every startup (so a fresh dev environment shows alerts immediately instead of waiting up to 24 hours). This catches medicines that simply crossed an expiry threshold with the passage of time, which nothing else would otherwise trigger a check for.

**Email digest:** enabled by default (`app.notifications.email.enabled=true`), but needs real SMTP credentials and a recipient to actually send anything — without them it's harmless (logs a warning instead of breaking the app). Set these as environment variables before running (don't hardcode credentials in `application.properties`):

```bash
export MAIL_HOST=smtp.gmail.com          # or your provider's SMTP host
export MAIL_PORT=587
export MAIL_USERNAME=you@gmail.com
export MAIL_PASSWORD=your-app-password   # NOT your regular account password
export NOTIFY_EMAIL_TO=alerts@yourpharmacy.example
mvn spring-boot:run
```

If using Gmail: you need an **App Password**, not your normal login password — enable 2-Step Verification on the Google account, then generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Regular passwords are rejected by Gmail's SMTP.

Once configured, you'll get an email whenever the daily sweep (or an immediate stock/expiry event) finds new alerts. To go back to no emails at all, set `app.notifications.email.enabled=false` (or omit the env vars — the in-app notification bell keeps working either way, since that part doesn't depend on email).

## Troubleshooting

**Step 1 — confirm the backend actually started.** After `mvn spring-boot:run`, scroll to the bottom of the terminal output. You must see a line like:
```
Started MedistockApplication in 3.2 seconds
```
If instead you see red text ending in `APPLICATION FAILED TO START`, the backend never came up — nothing on the frontend (login, register, anything) will work until this is fixed. Paste that error block if you need help with it — it always says exactly what's wrong (e.g. "Port 8080 was already in use", "Failed to configure a DataSource").

**Step 2 — confirm it's reachable.** Open `http://localhost:8080/api/health` directly in your browser. You should see JSON like `{"status":"UP",...}`. If this doesn't load, the frontend can't reach it either, no matter what the frontend shows.

**Common causes:**
- **Wrong Java version.** Requires JDK 17+. Check with `java -version`. Wrong version fails the build with `invalid target release: 17`.
- **Port 8080 already in use** (e.g. a previous crashed instance still running). Error mentions `Port 8080 was already in use`. Kill the old process or change `server.port` in `application.properties`.
- **Stale H2 lock file** from a forced shutdown. Stop the app, delete the `data/` folder, restart.
- **CORS** — if you run the frontend on a port other than `5173` or `3000`, add it to `app.cors.allowed-origins` in `application.properties`.

The frontend tells you explicitly when it can't reach the backend at all, versus when the backend responded with an actual error (wrong password, validation issue, etc.) — so check the error message on the login/register form itself first.

## Notes on scope
This implementation covers Milestone 1 (auth + schema), Milestone 2 (inventory, supplier management, stock tracking, search/filter), and Milestone 3 (expiry tracking, notifications, inventory analytics) in full. OAuth2 social login, SMS/push notifications (Twilio/FCM), PDF/Excel export, and Kafka/RabbitMQ messaging (Milestone 4 extras) are not wired up yet — the codebase is structured (services/controllers separated) so they can be added incrementally.
