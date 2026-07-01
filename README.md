# Personal Life ERP

A production-style Personal Life ERP monorepo built with Spring Boot 3, Java 21, React 19, TypeScript, Vite, Tailwind CSS, REST APIs, JWT security, MySQL-ready persistence, Docker, and Render deployment notes.

## Modules

- Authentication: register, login, refresh token contract, profile, password change, email verification-ready model.
- Dashboard: today tasks, expenses, upcoming events, goal progress, habit streaks, quick notes, weather placeholder, recent activity.
- Tasks: priorities, recurring metadata, subtasks-ready model, labels, categories, kanban/list/calendar views.
- Expenses: income, expenses, categories, budgets, savings, analytics, export-ready service boundaries.
- Goals: year, monthly, weekly goals with milestones and progress.
- Habits: daily, weekly, monthly habits with logs and streak analytics.
- Notes: markdown/rich-text-ready body, tags, pinned notes, folders, search.
- Document Vault: metadata for PDF/images/certificates/offer letters/resume with local storage paths and future S3 strategy.
- Calendar: monthly, weekly, daily events, birthdays, reminders.
- AI Assistant: local chat UX with service boundary for future OpenAI API integration.
- Analytics and Settings.

## Repository Layout

```text
life-erp/
  backend/
  frontend/
  database/
  docker-compose.yml
```

## Backend Run Commands

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080` and exposes OpenAPI at `http://localhost:8080/swagger-ui/index.html`.

## Frontend Run Commands

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

## Docker Commands

```bash
docker compose up --build
```

This starts MySQL, the Spring Boot API, and the React app.

## Database Import Script

Use [database/schema.sql](database/schema.sql) to create the normalized database:

```bash
mysql -u root -p < database/schema.sql
```

## Production Deployment (Render + Aiven)

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide: pushing to GitHub,
provisioning a free Aiven MySQL database, deploying the backend as a Render Docker web
service, deploying the frontend as a Render static site, wiring CORS between them, and a
pre-launch security checklist. A ready-to-use [`render.yaml`](render.yaml) blueprint is
also included for one-click provisioning.

