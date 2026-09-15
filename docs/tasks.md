# Tasks & Progress

Status key: `[x]` done · `[~]` in progress · `[ ]` to do

## Done (see `src/changelog.md` for version history)

- [x] v1: initial task planner
- [x] Move to React, Tailwind and React Router (v2.0.1)
- [x] Calendar view, list view, home dashboard, project planner (v2.0.2–v2.0.4)
- [x] Notification service (v2.0.6)
- [x] Time Planner view switcher that merges timeline, calendar and list (v2.0.7)
- [x] Card-style task UI and date field in the task form (v2.0.9)
- [x] Dev Resources admin (v2.0.10)
- [x] Date/time validation fix in the form (v2.0.11)
- [x] Local login/sign-up with private routes
- [x] Google Calendar sync and reminder minutes on tasks
- [x] Hobby tracker with streaks and heatmap

## In progress (uncommitted changes in the working tree)

- [~] Dev Resources admin rework (`devresadmin.jsx`)
- [~] Task form, sheet mapper and calendar-sync updates

## Backlog

### Housekeeping
- [ ] Replace the default CRA test in `src/App.test.js`, which looks for "learn react" and fails.
- [ ] Replace the default CRA `README.md` with real setup and deploy docs.
- [ ] Choose one build system (CRA or webpack) and remove the other.
- [ ] Align the `package.json` version (0.1.2) with the app version (v2.0.11).
- [ ] Remove the unused `API_URL` and state from `home.jsx`, and the commented-out imports in `portfolio.jsx`.
- [ ] Move the Apps Script URLs into `REACT_APP_*` env vars.

### Product
- [ ] Use the logged-in user for `user name` and `user type`. They are currently hard-coded in `sheet-mapper.js`.
- [ ] Real authentication. Passwords are currently stored in plain text in localStorage.
- [ ] Dashboard stat cards (total tasks, hours planned, completion rate), as in `Insfireup/`.
- [ ] Goals page.
- [ ] Analytics or productivity overview.
- [ ] Task search.

### Design
- [ ] Replace the raw hex colours in `portfolio.jsx` with design tokens.
- [ ] Contrast and keyboard accessibility pass.
