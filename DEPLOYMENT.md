# Deploying Personal Life ERP to Production

This guide walks through hosting the app for real using three free/low-cost services:

- **GitHub** — source control, and the trigger Render deploys from.
- **Aiven** — managed MySQL database (the backend's datastore).
- **Render** — hosts the Spring Boot API (Docker web service) and the React frontend (static site).

Follow the steps in order. Total time: ~30-45 minutes.

## Architecture

```
GitHub repo
   |
   |-- push --> Render (auto-deploy)
                  |-- life-erp-backend   (Docker web service, Spring Boot, port from $PORT)
                  |-- life-erp-frontend  (Static site, React build output)
                        |
                        v
                  calls life-erp-backend over HTTPS (VITE_API_BASE_URL)

life-erp-backend
   |-- connects over SSL --> Aiven MySQL (life_erp database)
```

---

## Step 0 — Before you start

Two things in this repo need your attention before anything goes to GitHub:

1. **`backend/storage/`** currently contains real uploaded files from your local testing (a passport scan, a birth affidavit PDF, etc). The `.gitignore` has already been updated so this folder's contents are excluded from git (only an empty `.gitkeep` placeholder is tracked). Double-check none of those files end up in your repo — see the verification command in Step 1.
2. **JWT secret**: `application.yml` ships with a fallback dev secret. For production you must set a real, unique `JWT_SECRET` as a Render environment variable (Step 3) — never rely on the fallback in a public deployment.

---

## Step 1 — Push the project to GitHub

```bash
cd "C:\Users\dhana\OneDrive\Desktop\Personal-Life-ERP"

git init
git add -A

# Sanity check: this must print NOTHING. If it prints file paths,
# stop and fix .gitignore before committing.
git status --porcelain | grep "backend/storage/" | grep -v ".gitkeep"

git commit -m "Initial commit: Personal Life ERP"
```

Create a new empty repository on GitHub (no README/license, since you already have one):

1. Go to https://github.com/new
2. Repository name: `personal-life-erp` (or anything you like)
3. Keep it **Private** if it will ever hold real personal documents.
4. Click **Create repository**, then copy the remote URL it gives you.

Push:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/personal-life-erp.git
git push -u origin main
```

You'll need a GitHub personal access token or the GitHub CLI (`gh auth login`) if you're not already authenticated — GitHub no longer accepts plain passwords over HTTPS git pushes.

---

## Step 2 — Create the Aiven MySQL database

1. Sign up at https://aiven.io (no credit card needed for the free tier).
2. Click **Create service** → choose **MySQL**.
3. Plan: select the **Free** tier (1 GB RAM / 1 GB storage / 1 CPU — plenty for personal use). Note: Aiven auto-suspends free services after a period of inactivity; you'll get an email warning first, and can restart it from the console anytime.
4. Pick any cloud/region close to where Render will run your backend (e.g. an AWS/GCP region in the US if you'll deploy Render to Oregon).
5. Name it `life-erp-mysql` and click **Create service**. Provisioning takes 1-3 minutes.

Once the service is **Running**, open its **Overview** tab and note these values:

- **Host**
- **Port**
- **User** (default `avnadmin`)
- **Password**
- **Default database name** (usually `defaultdb`)

### Create the app database and import the schema

Aiven gives you a `defaultdb` out of the box, but this project expects a database named `life_erp`. Easiest path: use the Aiven web console's **Query Editor** (or `mysql` CLI) to create it and load the schema.

Using the `mysql` CLI from your own machine (Aiven requires SSL, which the CLI does automatically when given `--ssl-mode=REQUIRED`):

```bash
mysql --host=<HOST> --port=<PORT> --user=avnadmin --password=<PASSWORD> \
      --ssl-mode=REQUIRED \
      -e "CREATE DATABASE IF NOT EXISTS life_erp;"

mysql --host=<HOST> --port=<PORT> --user=avnadmin --password=<PASSWORD> \
      --ssl-mode=REQUIRED life_erp < database/schema.sql
```

(No `mysql` CLI installed locally? Use Aiven's built-in web **Query Editor**, switch to a new database named `life_erp`, and paste the contents of `database/schema.sql` there instead. Or skip this step entirely — the backend's `ddl-auto: update` setting will auto-create all tables from the JPA entities on first boot. Running `schema.sql` up front just guarantees indexes/constraints match exactly.)

Keep this browser tab open — you'll need the host/port/password again in Step 3.

---

## Step 3 — Deploy the backend to Render

1. Sign up / log in at https://render.com and connect your GitHub account (**Account Settings → GitHub → Configure**), granting it access to your new repo.
2. Click **New +** → **Web Service**.
3. Select your `personal-life-erp` repo.
4. Configure:
   - **Name**: `life-erp-backend`
   - **Root Directory**: `backend`
   - **Runtime/Environment**: **Docker** (Render will auto-detect `backend/Dockerfile`)
   - **Instance Type**: **Free** to start (spins down after 15 min idle; upgrade to **Starter** later if you want it always-on and/or need a persistent disk — see the storage note below)
5. Scroll to **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://<AIVEN_HOST>:<AIVEN_PORT>/life_erp?sslMode=REQUIRED&createDatabaseIfNotExist=true` |
   | `SPRING_DATASOURCE_USERNAME` | `avnadmin` |
   | `SPRING_DATASOURCE_PASSWORD` | `<AIVEN_PASSWORD>` |
   | `JWT_SECRET` | a long random string — generate one with `openssl rand -base64 48` |
   | `APP_CORS_ALLOWED_ORIGINS` | *(leave a placeholder like* `https://placeholder.onrender.com` *for now — you'll update this in Step 5 once the frontend URL exists)* |

   Render automatically injects `PORT`; the app now reads it via `server.port: ${PORT:8080}`, so you don't need to set it yourself.

6. Click **Create Web Service**. Watch the **Logs** tab — first build takes a few minutes (Maven download + compile + Docker image build). A successful boot ends with a Spring Boot startup banner and `Started LifeErpApplication`.
7. Once live, note the public URL Render assigns, e.g. `https://life-erp-backend.onrender.com`. Test it:

   ```bash
   curl https://life-erp-backend.onrender.com/api/v1/auth/login -i
   ```

   A `400`/`401`/`403` response (not a connection error or 502) means the API is up and reachable.

### About file uploads (Vault) and the free plan

Render's **free** and default **Starter** web services use an ephemeral filesystem — anything written to `backend/storage` (Vault uploads) is wiped on every deploy or restart. For a personal-use app this is usually fine to start with, but if you want uploaded documents to survive redeploys:

1. Upgrade the backend to at least the **Starter** paid instance type.
2. In the service's **Disks** tab, add a persistent disk (e.g. 1 GB, ~$0.25/GB/month) mounted at `/app/storage`.
3. Set an environment variable `APP_STORAGE_ROOT` = `/app/storage`.
4. Redeploy.

Without a disk, treat the Vault as temporary/demo storage in production — don't rely on it for the only copy of important documents.

---

## Step 4 — Deploy the frontend to Render

1. From the Render dashboard, click **New +** → **Static Site**.
2. Select the same GitHub repo.
3. Configure:
   - **Name**: `life-erp-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add an environment variable (used at build time by Vite):

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://life-erp-backend.onrender.com/api/v1` (use your actual backend URL from Step 3) |

5. Under **Redirects/Rewrites**, add a rewrite rule so client-side routing works on refresh/deep links:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**
6. Click **Create Static Site**. Once built, note its URL, e.g. `https://life-erp-frontend.onrender.com`.

---

## Step 5 — Connect the two: fix CORS

Go back to the **life-erp-backend** service → **Environment** tab, and update:

| Key | Value |
|---|---|
| `APP_CORS_ALLOWED_ORIGINS` | `https://life-erp-frontend.onrender.com` |

(Comma-separate multiple origins if you also want to allow a custom domain later.) Save — Render will automatically redeploy the backend with the new value.

---

## Step 6 — Test it end to end

1. Open `https://life-erp-frontend.onrender.com`.
2. Register a new account, log in, create a task/expense/event, upload a document to the Vault, and confirm PDF preview/download both work.
3. If anything fails, check both **Logs** tabs on Render:
   - Frontend build errors → usually a missing env var or `tsc` type error.
   - Backend runtime errors → usually a datasource connection issue (wrong Aiven host/port/password, or missing `sslMode=REQUIRED`) or a CORS mismatch (browser console will show a CORS error naming the blocked origin).

---

## Custom domain (optional)

Both the Render static site and web service support custom domains for free under **Settings → Custom Domains**. Point a CNAME at the Render-provided hostname, then update `APP_CORS_ALLOWED_ORIGINS` and `VITE_API_BASE_URL` to match your real domains and redeploy both services.

---

## Ongoing deploys

Both Render services are set to auto-deploy on every push to `main` (via `autoDeploy` in `render.yaml`, or the equivalent dashboard toggle). Going forward:

```bash
git add -A
git commit -m "your change"
git push
```

...is all it takes — Render rebuilds and redeploys both services automatically.

---

## Security checklist before going live

- [ ] `JWT_SECRET` on Render is a unique random value, not the `application.yml` fallback.
- [ ] `backend/storage/` was never committed to git (verified in Step 1).
- [ ] The GitHub repo is **Private** if it will ever contain real personal-document metadata or database credentials in commit history.
- [ ] `APP_CORS_ALLOWED_ORIGINS` lists only the frontend origins you actually trust — not `*`.
- [ ] Aiven database password and Render env vars are not pasted into any public place (issues, chat, etc).
- [ ] If you rotate the Aiven password or JWT secret later, update it in Render's **Environment** tab and let it redeploy.

---

## Optional: one-click redeploy via `render.yaml`

A `render.yaml` blueprint is included at the repo root, mirroring the manual setup above. To use it instead of the manual dashboard steps: on Render, choose **New +** → **Blueprint**, point it at this repo, and Render will provision both services from the file — you'll still be prompted to fill in the Aiven-related secrets by hand, since Aiven isn't a Render-managed resource.
