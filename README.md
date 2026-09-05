# CloudDrive — Cloud Based File Storage Service (Java + React)

A working MVP of the Google-Drive-style storage app from the spec: JWT auth, nested
folders, file upload/download, sharing (Viewer/Editor), public share links with
expiry + password, search with filters, starred files, trash/restore, file preview,
and an Admin role with full platform oversight.

## 🔗 Live Demo

- **App:** https://cloud-storage-app-sigma.vercel.app


**Demo admin login** (auto-created on first backend startup — full oversight of all users & files):
```
email:    admin@clouddrive.com
password: Admin@123
```

> Note: the backend runs on Render's free tier, which spins down after ~15 minutes
> of inactivity. The first request after idle time can take 30–50 seconds to wake
> back up — that's expected, not a bug.

---

Two independent projects:

```
cloud-storage/
├── backend/    Spring Boot 3.3 (Java 17) — open this folder as a Maven project in IntelliJ
└── frontend/   React 18 + Vite + Tailwind
```

---

## 1. Backend (IntelliJ)

**Open in IntelliJ:** `File → Open` → select the `backend` folder (the one with `pom.xml`).
IntelliJ will detect it as a Maven project and prompt to import — accept it. It will
download all dependencies from Maven Central automatically (needs internet access).

**Requirements:** JDK 17+ (Project Structure → SDK).

**Run it:** open `CloudStorageApplication.java` and click the green ▶ run icon, or:

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

### Database
Ships with **H2** (file-based, at `backend/data/clouddb`) so it runs with **zero setup** —
no Postgres install needed locally. Data persists across restarts on disk.

- H2 console (optional, to inspect data): http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:file:./data/clouddb`
  - User: `sa`, Password: *(blank)*

**In production**, the app uses PostgreSQL via the `postgres` Spring profile — see
Section 4 (Deployment) below.

### File storage
Uploaded files are saved to `backend/storage/{userId}/...` on local disk (path is
configurable via `app.storage.base-path` / `APP_STORAGE_PATH`). `StorageService.java`
isolates all storage calls — swap it for the AWS SDK (S3) later without touching
controllers or the DB schema.

### JWT secret
Change `app.jwt.secret` in `application.yml` (local) or `APP_JWT_SECRET` (production)
before deploying anywhere real — the repo's default is a placeholder.

---

## 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on **http://localhost:5173**. Points at `http://localhost:8080/api` by default
(see `.env.example` → copy to `.env` if you want to change it, or set
`VITE_API_BASE_URL` at build time for deployment).

---

## 3. Try it end-to-end (locally)

1. Start the backend (port 8080), then the frontend (port 5173).
2. Go to http://localhost:5173 → **Sign up** with any name/email/password (6+ chars),
   or use the **"Sign in as demo admin"** button on the login page.
3. Create a folder, drag & drop a file to upload it.
4. Click a file to preview it (images/PDFs render inline; other types offer download).
5. Click the **⋮** menu on a file → **Share** to invite another user's email, set
   Viewer/Editor role, or generate a **public link** (with optional expiry/password).
6. Star a file, move it to Trash, then restore it from the Trash view.
7. Log in as the demo admin to see **Admin** in the sidebar — view/deactivate any
   user, browse every file across all users with storage totals, delete any file.

---

## What's implemented vs. the original spec

**Included (Section 2.1 Core MVP):**
- Email/password auth with JWT (Google OAuth2 login is not wired up — see note below)
- Nested folder management, file upload/download
- File sharing with Viewer/Editor roles — Editors can rename, trash, and upload
  new content (replace) for files shared with them, not just view
- Public share links with expiry + optional password
- Search with filters (file type, date range), starred files, trash & restore
- File preview — clicking a file opens an inline preview for images and PDFs;
  other types offer a direct download
- Admin role — a platform-owner account with full oversight: view/deactivate any
  user, view every file across all users with storage totals, delete any file

**Not included (Section 2.2, Phase 2+):** file versioning (replace overwrites, it
doesn't keep history), activity logs, tags/labels, storage quotas/plans.

**Deliberate MVP simplifications:**
- **Storage:** local disk instead of AWS S3/Supabase (no cloud account needed to run
  it locally). `StorageService.java` is the one place to change when you're ready
  for S3. Note: on Render's free tier, local disk is ephemeral — see Section 4.
- **Auth:** email+password only, no Google OAuth2 — that needs your own Google Cloud
  credentials to configure, so it's left as a clearly-marked extension point in
  `SecurityConfig.java` rather than guessed at.
- **Database:** H2 locally (zero setup), PostgreSQL (via Neon) in production.

### Admin account
A default admin is created automatically the first time the backend starts:
```
email:    admin@clouddrive.com
password: Admin@123
```
**Change this password** (or delete/replace the account) before using this anywhere
beyond a demo. Any other user stays a normal `USER` unless promoted directly in the
database (`users.role = 'ADMIN'`) — there's no self-service "become admin" flow.

## API reference

All endpoints are under `/api`. Protected endpoints need `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Folders | `POST /folders`, `GET /folders/{id}`, `GET /folders/{id}/contents`, `GET /folders/root/contents`, `PUT /folders/{id}/rename`, `PUT /folders/{id}/move`, `DELETE /folders/{id}`, `PUT /folders/{id}/restore`, `GET /folders/search?q=` |
| Files | `POST /files/upload` (multipart), `GET /files/{id}`, `GET /files/{id}/download`, `PUT /files/{id}/rename`, `PUT /files/{id}/move`, `DELETE /files/{id}`, `PUT /files/{id}/restore`, `DELETE /files/{id}/permanent`, `PUT /files/{id}/star`, `PUT /files/{id}/unstar`, `GET /files/starred`, `GET /files/search?q=`, `PUT /files/{id}/replace` |
| Trash | `GET /trash` |
| Sharing | `POST /shares`, `GET /shares/shared-with-me`, `GET /shares/file/{fileId}`, `DELETE /shares/{shareId}` |
| Public links | `POST /public-links` (auth), `GET /public-links/{token}/download?password=` (public) |
| Admin (ROLE_ADMIN only) | `GET /admin/users`, `PUT /admin/users/{id}/status`, `GET /admin/files`, `DELETE /admin/files/{id}`, `GET /admin/stats` |

File search also accepts `type` (`image`/`video`/`audio`/`document`/`spreadsheet`/`archive`),
`dateFrom`, and `dateTo` (ISO date, e.g. `2026-08-01`) as optional query params.
`PUT /files/{id}/replace` (multipart) lets the owner or a shared Editor upload new
content for an existing file.

---

## 4. Deployment

The project supports two configs: **local dev** (H2 + local disk, default) and
**production** (PostgreSQL + env-driven secrets, via the `postgres` Spring profile).

### 4.1 Backend → Render (Docker) + Neon (Postgres)

Render doesn't run Java natively — deploy it as a **Docker** image (a `Dockerfile`
is included in `backend/`).

1. Push the project to GitHub.
2. Create a free database at [neon.tech](https://neon.tech) → copy the connection
   string from the dashboard (format: `postgresql://user:pass@host/db?sslmode=require`).
   Neon's free tier doesn't expire, unlike Render's own Postgres (~90 days).
3. On [render.com](https://render.com): **New → Web Service** → connect your repo:
   - **Root directory:** `backend`
   - **Language:** **Docker** (not Node/Python — Render finds the `Dockerfile` automatically)
   - Leave Build/Start commands blank — the Dockerfile handles both.
4. Add these environment variables:

   | Key | Value |
   |---|---|
   | `SPRING_PROFILES_ACTIVE` | `postgres` |
   | `DATABASE_URL` | `jdbc:postgresql://<neon-host>/<db>?sslmode=require` (prefix with `jdbc:`) |
   | `DATABASE_USERNAME` | from your Neon connection string |
   | `DATABASE_PASSWORD` | from your Neon connection string |
   | `APP_JWT_SECRET` | any long random string — don't reuse the repo's placeholder |
   | `APP_CORS_ALLOWED_ORIGINS` | your Vercel URL once you have it, e.g. `https://your-app.vercel.app` |
   | `APP_PUBLIC_LINK_BASE_URL` | `https://<your-render-service>.onrender.com/api/public-links` |
   | `APP_STORAGE_PATH` | `/var/data/storage` |

5. Deploy. Render assigns a public URL — that's your API base URL for the frontend.

**Important — file storage on Render's free tier:** local disk is wiped on every
redeploy/restart and isn't shared across instances. For anything beyond a demo,
either attach a [Render persistent disk](https://render.com/docs/disks), or migrate
`StorageService.java` to AWS S3 (the class is intentionally isolated for this swap).

### 4.2 Frontend → Vercel

1. **New Project** → import the same repo.
2. **Root directory:** `frontend` (Vite auto-detected).
3. Environment variable: `VITE_API_BASE_URL` = `https://your-app.onrender.com/api`
4. Deploy → copy the resulting URL.
5. Back on Render, set `APP_CORS_ALLOWED_ORIGINS` to that exact Vercel URL → redeploy.

### 4.3 Verify

Visit your Vercel URL → sign up → upload a file → confirm it downloads. Log in with
the demo admin and confirm `/admin` loads.

### 4.4 Alternatives

- **Backend:** Railway or AWS EC2 — same env vars, same `postgres` profile.
- **Frontend:** Netlify — same build command, same env var.
- **Database:** Supabase or AWS RDS instead of Neon.

## Next steps if you want to extend it
- Add Google OAuth2 login (`spring-boot-starter-oauth2-client` + a Google Cloud
  console app) — `SecurityConfig.java` is where the filter chain lives.
- Swap `StorageService` for the AWS S3 SDK and add signed URLs for direct upload.
- Add file previews for more types, versioning, and activity logs per Section 2.2.
