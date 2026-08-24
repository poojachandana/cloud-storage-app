# CloudDrive — Cloud Based File Storage Service (Java + React)

A working MVP of the Google-Drive-style storage app from the spec: JWT auth, nested
folders, file upload/download, sharing (Viewer/Editor), public share links with
expiry + password, search, starred files, and trash/restore.

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
no Postgres install needed. Data persists across restarts on disk.

- H2 console (optional, to inspect data): http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:file:./data/clouddb`
  - User: `sa`, Password: *(blank)*

**To switch to PostgreSQL later:**
1. In `pom.xml`, uncomment the `postgresql` dependency and remove/comment the `h2` one.
2. In `application.yml`, comment out the H2 `datasource` block and uncomment the
   PostgreSQL block, filling in your own DB name/credentials.

### File storage
Uploaded files are saved to `backend/storage/{userId}/...` on local disk (path is
configurable via `app.storage.base-path` in `application.yml`). This keeps the MVP
runnable without any AWS setup. `StorageService.java` isolates all storage calls —
swap it for the AWS SDK (S3) later without touching controllers or the DB schema.

### JWT secret
Change `app.jwt.secret` in `application.yml` before deploying anywhere real — the
default in the repo is a placeholder.

---

## 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on **http://localhost:5173**. It already points at `http://localhost:8080/api`
(see `.env.example` → copy to `.env` if you want to change it).

I ran `npm install && npm run build` while building this and it compiles cleanly.

---

## 3. Try it end-to-end

1. Start the backend (port 8080), then the frontend (port 5173).
2. Go to http://localhost:5173 → **Sign up** with any name/email/password (6+ chars).
3. Create a folder, drag & drop a file to upload it.
4. Click the **⋮** menu on a file → **Share** to invite another user's email (they need
   an account first) or generate a **public link** (with optional expiry/password).
5. Star a file, move it to Trash, then restore it from the Trash view.

---

## What's implemented vs. the original spec

**Included (Section 2.1 Core MVP):**
- Email/password auth with JWT (Google OAuth2 login is not wired up — see note below)
- Nested folder management, file upload/download
- File sharing with Viewer/Editor roles — **Editors can rename, trash, and upload
  new content (replace) for files shared with them**, not just view
- Public share links with expiry + optional password
- Search **with filters** (file type, date range), starred files, trash & restore
- **File preview** — clicking a file (not just the ⋮ menu) opens an inline preview
  for images and PDFs; other types offer a direct download
- **Admin role** — a platform-owner account with full oversight: view/deactivate
  any user, view every file across all users with storage totals, delete any file

**Not included (Section 2.2, Phase 2+):** file versioning (replace overwrites, it
doesn't keep history), activity logs, tags/labels, storage quotas/plans.

**Deliberate MVP simplifications:**
- **Storage:** local disk instead of AWS S3/Supabase (no cloud account needed to run
  it). `StorageService.java` is the one place to change when you're ready for S3.
- **Auth:** email+password only, no Google OAuth2 — that needs your own Google Cloud
  credentials to configure, so it's left as a clearly-marked extension point in
  `SecurityConfig.java` rather than guessed at.
- **Database:** H2 by default instead of PostgreSQL, purely so the project runs
  instantly in IntelliJ with no external services. Switching to Postgres is two
  config changes (see above) since it's already plain JPA/Hibernate.

### Admin account
A default admin is created automatically the first time the backend starts:

```
email:    admin@clouddrive.com
password: Admin@123
```

Log in with these on the frontend and you'll see an **Admin** link in the sidebar.
**Change this password** (or delete/replace the account) before using this anywhere
real — the credentials are printed once in the backend console on first startup too.
Any other user stays a normal `USER` unless promoted directly in the database
(`users.role = 'ADMIN'`) — there's no self-service "become admin" flow, by design.

## API reference

All endpoints are under `/api`. Protected endpoints need `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Folders | `POST /folders`, `GET /folders/{id}`, `GET /folders/{id}/contents`, `GET /folders/root/contents`, `PUT /folders/{id}/rename`, `PUT /folders/{id}/move`, `DELETE /folders/{id}`, `PUT /folders/{id}/restore`, `GET /folders/search?q=` |
| Files | `POST /files/upload` (multipart), `GET /files/{id}`, `GET /files/{id}/download`, `PUT /files/{id}/rename`, `PUT /files/{id}/move`, `DELETE /files/{id}`, `PUT /files/{id}/restore`, `DELETE /files/{id}/permanent`, `PUT /files/{id}/star`, `PUT /files/{id}/unstar`, `GET /files/starred`, `GET /files/search?q=` |
| Trash | `GET /trash` |
| Sharing | `POST /shares`, `GET /shares/shared-with-me`, `GET /shares/file/{fileId}`, `DELETE /shares/{shareId}` |
| Public links | `POST /public-links` (auth), `GET /public-links/{token}/download?password=` (public) |
| Admin (ROLE_ADMIN only) | `GET /admin/users`, `PUT /admin/users/{id}/status`, `GET /admin/files`, `DELETE /admin/files/{id}`, `GET /admin/stats` |

File search also accepts `type` (`image`/`video`/`audio`/`document`/`spreadsheet`/`archive`),
`dateFrom`, and `dateTo` (ISO date, e.g. `2026-08-01`) as optional query params.
`PUT /files/{id}/replace` (multipart) lets the owner or a shared Editor upload new
content for an existing file.

## Next steps if you want to extend it
- Add Google OAuth2 login (`spring-boot-starter-oauth2-client` + a Google Cloud
  console app) — `SecurityConfig.java` is where the filter chain lives.
- Swap `StorageService` for the AWS S3 SDK and add signed URLs for direct upload.
- Add file previews (images/PDFs) and versioning per Section 2.2 of the spec.
