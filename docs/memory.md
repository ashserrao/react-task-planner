# Project Context

Short, durable facts for anyone (human or AI) picking up this project. Update this file when something here stops being true.

## Identity

- **Name:** Ashtro Planner (repo: `react-taskplanner`). Built by Ashtro Dev (Anush Serrao).
- **App version:** v2.0.11 (footer in `portfolio.jsx` and `src/changelog.md`).
- **Branches:** work happens on `master`. `main` is the PR base.

## Things that are easy to get wrong

- **Routing uses `HashRouter`**, so URLs look like `/#/todo-list`. This is deliberate, for static hosting.
- **Two backends**, both Google Apps Script:
  - Tasks: `src/lib/api.js`, with source in `apps-script/Code.gs` (sheet tab "Timer" in the "Task_planner" spreadsheet).
  - Dev resources: `src/Components/devResourcesApi.js`, a separate "Resource Sheet" script whose source is **not** in this repo.
- After changing `apps-script/Code.gs`, you must **redeploy** the web app in Apps Script. The repo copy is not deployed automatically.
- Apps Script can't handle CORS preflight, so POSTs use `text/plain`.
- `rowNumber` is not a sheet column. `doGet` generates it, and update and delete depend on it.
- Legacy sheet rows are shifted by one column. `fromSheetRow` detects and fixes them, so don't "simplify" that code away.
- "Projects" in the Project Tracker are **task categories**, not a separate entity.
- The Hobby Tracker is also built on tasks and their categories.
- Auth is client-side only, with a demo login of `demo@ashtro.dev` / `Demo@123`.
- The category "study" was renamed to "learning" in v2.0.8.

## Folders that aren't code

- `Insfireup/`: UI inspiration screenshots ("TimeFlow" dashboard mockups).
- `build/` and `dist/`: build outputs, which are git-ignored.

## Docs index

- [prd.md](prd.md): what we're building and why
- [architecture.md](architecture.md): how it's built
- [rules.md](rules.md): coding conventions
- [design.md](design.md): UI/UX direction
- [tasks.md](tasks.md): progress and backlog
