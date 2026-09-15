# Product Requirements — Ashtro Planner

## Summary

Ashtro Planner is a personal productivity web app for planning the day, tracking tasks and projects, building habits, and keeping a library of developer resources. Data lives in Google Sheets (through Google Apps Script web apps). Tasks can also be synced to Google Calendar.

## Target user

A single power user, the owner and admin. This is a personal tool, not a multi-tenant SaaS. Sign-up exists, but accounts are local to the browser (see [architecture.md](architecture.md#authentication)).

## Goals

1. Plan a day in 15-minute slots and see it as a timeline, a calendar or a list.
2. Track progress on projects (task categories) and on daily habits.
3. Keep tasks in a Google Sheet so they can be edited outside the app and survive across devices.
4. Optionally push tasks to Google Calendar with a reminder.
5. Curate a searchable, tagged list of developer resources.

## Non-goals (for now)

- Real multi-user accounts, server-side auth, or sharing between users.
- Offline-first sync with conflict resolution. The app only keeps a localStorage cache of the last task list.
- Native mobile apps. The web UI must work at phone width instead.

## Features

| Area | Route | Description |
|---|---|---|
| Auth | `/login`, `/signup` | Local login/sign-up with a built-in demo account. All other routes require login. |
| Home | `/` | Hive background plus the **Hobby Tracker**: habits with streaks, a 30-day heatmap and a 7-day mini row. |
| Time Planner | `/time-planner` | One page with a view switcher for **Timeline**, **Calendar** and **List**. |
| Project Tracker | `/project-track` | Each task category is a project card with completion %, and you can drill into its tasks. |
| To-Do List | `/todo-list` | Day-by-day task list with prev/next/today navigation and a date picker. |
| Dev Resources Admin | `/dev-res-admin` | CRUD for dev resources (URL, title, tags, Markdown notes), stored in a separate "Resource Sheet". |
| Notifications | global | Toasts for success and failure, including Calendar sync errors. |

## Task model (user-facing fields)

Title, description/notes, date, start time (15-min steps), duration (at least 0.25 h), priority, category, status, ticket type, sync to Google Calendar (on/off), and reminder minutes (default 30).

## Success criteria

- Creating, editing or deleting a task reaches the sheet, and the UI shows it without a manual reload.
- A Calendar sync failure never blocks the sheet save, and the user sees a toast about it.
- Every page is usable at 375 px wide with no horizontal scroll.

## Open questions

- Should auth move to a real provider (for example Google sign-in), given the backend is already Google?
- Should the "user name" and "user type" fields come from the logged-in user instead of hard-coded defaults?
- Should the Goals and Analytics screens from the inspiration mockups (`Insfireup/`) be built?
