# Ashtro Planner (react-taskplanner)

A personal productivity web app for planning your day, tracking tasks and projects, building habits, and keeping a library of developer resources. It's built with React and Tailwind CSS. All data is stored in **Google Sheets** through Google Apps Script web apps, and tasks can be synced to **Google Calendar** with reminders.

> Current app version: **v2.0.11**. See [src/changelog.md](src/changelog.md) for the full version history.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Backend: Google Apps Script](#backend-google-apps-script)
- [Task model](#task-model)
- [Authentication](#authentication)
  - [Accounts and roles](#accounts-and-roles)
- [Notifications](#notifications)
- [Design system](#design-system)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Further documentation](#further-documentation)
- [Author](#author)

---

## Features

| Area | Route | What it does |
|---|---|---|
| **Login / Sign-up** | `/login`, `/signup` | Local login and sign-up. There's an admin account (real data) and a demo account (sandboxed dummy data). Every other route requires you to be logged in. |
| **Home** | `/` | An animated hexagon "hive" background and the **Hobby Tracker**: habits with streaks, a 30-day heatmap and a 7-day mini row. |
| **Time Planner** | `/time-planner` | A single page with a view switcher for **Timeline** (the day in 15-minute slots), **Calendar** (month view) and **List**. |
| **Project Tracker** | `/project-track` | Each task category is shown as a project card with its completion %. Open a card to see its tasks. |
| **To-Do List** | `/todo-list` | Tasks for one day at a time, with previous/next/today buttons and a date picker. |
| **Nec Doc** *(admin only)* | `/nec-doc` | A shortcut to a linked Google Doc of notes. |
| **Dev Resources Admin** *(admin only)* | `/dev-res-admin` | Create, edit and delete developer resources (URL, title, tags, Markdown notes). These are stored in a separate "Resource Sheet". |
| **Notifications** | `/notifications` + bell in navbar | Pop-up toasts for success and failure, plus a per-user notification inbox that is saved in the browser. |

Other things the app does:

- **Google Calendar sync:** you can turn on calendar sync for each task and set a reminder (30 minutes by default).
- **Overlap detection:** tasks that overlap in time are detected and laid out side by side on the timeline.
- **Drag and drop** with `@dnd-kit`.
- **Instant first load:** the last task list is cached in `localStorage`, so the page renders immediately and then refreshes from the sheet.
- **Responsive layout:** every page works at 375 px wide, with a full-screen menu on mobile.

---

## Tech stack

| Concern | Library |
|---|---|
| UI framework | React 18 (function components and hooks) |
| Routing | React Router 7 (`HashRouter`, so it works on static hosts such as GitHub Pages) |
| Styling | Tailwind CSS 3, `tailwindcss-animate`, CSS-variable design tokens |
| Animation | framer-motion |
| Icons | lucide-react, react-icons |
| Dates | date-fns |
| Drag and drop | @dnd-kit/core, @dnd-kit/sortable |
| Primitives | Radix UI (Dialog, Popover), react-aria-components |
| Markdown | react-markdown and remark-gfm (resource notes) |
| Class utilities | clsx and tailwind-merge (`cn()` helper) |
| Backend | Google Apps Script web apps, Google Sheets, Google Calendar |
| Build | Create React App (`react-scripts`) **or** a custom webpack 5 setup |

---

## Getting started

### Prerequisites

- **Node.js** 18 or later, and **npm**
- If you want your own backend: a Google account to host the Apps Script and the Sheet (see [Backend](#backend-google-apps-script))

### Install and run

```bash
git clone https://github.com/ashserrao/react-taskplanner.git
cd react-taskplanner
npm install
npm start
```

Then open <http://localhost:3000>. You can log in with the built-in demo account:

| Field | Value |
|---|---|
| Email | `demo@ashtro.dev` |
| Password | `Demo@123` |

The demo account runs in a **sandbox with dummy data** and never touches the real Google APIs (see [Accounts and roles](#accounts-and-roles)). You can also sign up for a new local account, which gets the same sandbox. Accounts are stored only in your browser.

---

## Available scripts

The project has **two build setups** that work side by side:

| Command | Tool | Output | Notes |
|---|---|---|---|
| `npm start` | Create React App | dev server on :3000 | Hot reload and lint warnings |
| `npm run build` | Create React App | `build/` | Optimised production build |
| `npm test` | Jest + React Testing Library | — | Watch mode |
| `npm run start-web` | webpack (`webpack.config.js`) | dev server on :3000 | Uses `.babelrc` and `postcss.config.js` |
| `npm run build-web` | webpack | `dist/` | Hashed bundles, extracted CSS, copies `public/assets` |
| `npm run eject` | CRA | — | One-way operation. Avoid it. |

`verify-card.js` is an optional Playwright smoke script. It logs in with the demo account, opens the timeline and takes screenshots of a task card. To use it, install Playwright (`npm i -D playwright`), start the app, then run `node verify-card.js`.

---

## Project structure

```
react-taskplanner/
├── apps-script/
│   └── Code.gs                  Apps Script backend for tasks (sheet tab "Timer")
├── docs/                        Detailed project docs (architecture, PRD, design, rules, tasks)
├── Insfireup/                   UI inspiration screenshots (target dashboard style)
├── public/
│   ├── index.html
│   └── assets/                  favicon, logo, manifest.json
├── src/
│   ├── index.js                 Entry point: <HashRouter><App/></HashRouter>
│   ├── App.js                   Providers: Auth > Notification > TimeTracking > Portfolio
│   ├── portfolio.jsx            App shell: navbar, routes, footer
│   ├── changelog.md             Version history
│   ├── index.css                Tailwind layers and design tokens (CSS variables)
│   ├── Components/
│   │   ├── authentication/      AuthContext, PrivateRoute, login/sign-up forms, brand panel
│   │   ├── ui/                  Shared primitives: button, badge, dropdown-menu, popover,
│   │   │                        sheet, switch, collapsible, task-card, task-form-dialog,
│   │   │                        toaster, notification-service
│   │   ├── navbar.jsx           Top bar and mobile menu
│   │   ├── home.jsx             Home page (HiveBackground + HobbyTracker)
│   │   ├── HiveBackground.jsx   Decorative hexagon background
│   │   ├── hobbytracker.jsx     Habits, streaks, heatmap
│   │   ├── timeplanner.jsx      View switcher: timeline / calendar / list
│   │   ├── timeline.jsx         Daily timeline (15-minute slots)
│   │   ├── calendarview.jsx     Month calendar
│   │   ├── listview.jsx         Task list view
│   │   ├── projecttracker.jsx   Category-as-project tracker
│   │   ├── todo.jsx             Daily to-do list
│   │   ├── necdoc.jsx           Link to the notes Google Doc
│   │   ├── devresadmin.jsx      Dev Resources CRUD UI
│   │   ├── devResourcesApi.js   Client for the Resource Sheet Apps Script
│   │   ├── notifications.jsx    Notification centre page
│   │   ├── notification-bell.jsx / notification-list.jsx
│   └── lib/
│       ├── api.js               Client for the Task Apps Script
│       ├── sheet-mapper.js      Converts between sheet rows and app task objects
│       ├── time-tracking-context.js  Task state, CRUD, localStorage cache
│       ├── types.js             Time slots, categories, priority/status config, helpers
│       ├── notify.js            App-wide notification store (toasts + inbox)
│       ├── notification-types.js  Icon and colour for each notification type
│       ├── navigation.js        Nav links (single source of truth)
│       ├── format.js            Formatting helpers
│       └── utils.js             cn() helper
├── tailwind.config.js
├── webpack.config.js / .babelrc / postcss.config.js
└── package.json
```

---

## Architecture

### Provider tree

```
<HashRouter>
  <AuthProvider>              useAuth()           login, logout, sign-up, isAuthenticated
    <NotificationProvider>    useNotifications()  mounts <Toaster/>, per-user inbox
      <TimeTrackingProvider>  useTimeTracking()   tasks, selectedDate, CRUD
        <Portfolio/>          navbar + routes + footer
```

### Task data flow

```
UI component
  └─ useTimeTracking()                 lib/time-tracking-context.js
       └─ api.js  fetchTasks / createTaskRequest / updateTaskRequest / deleteTaskRequest
            └─ sheet-mapper.js  toSheetRow / fromSheetRow
                 └─ fetch(API_URL)     Apps Script web app (apps-script/Code.gs)
                      └─ Google Sheet "Timer"  (+ Google Calendar if sync is on)
```

- **Reads:** `GET ?action=list` returns every row. Each row has a generated `rowNumber`.
- **Writes:** `POST` with a `text/plain;charset=utf-8` body of `{ action, ...fields }`. Using `text/plain` avoids a CORS preflight, which Apps Script can't answer.
- **Row identity:** update and delete need `rowNumber`. `ticket id` is also sent when the row has one.
- **Errors:** Apps Script can return HTTP 200 with `{ result: "error" }` or `{ error }`. The clients turn those responses into thrown `Error`s.
- **Calendar failures:** a response can include `calendarError`. The sheet save still counts as a success, and a warning toast is shown.
- **Cache:** tasks are cached in `localStorage["taskplanner:tasks"]`.

### Adding a new page

1. Create the component in `src/Components/`.
2. Register its route in [src/portfolio.jsx](src/portfolio.jsx). Put it inside `<PrivateRoute>` if it needs a login.
3. Add a nav entry in [src/lib/navigation.js](src/lib/navigation.js).

---

## Backend: Google Apps Script

### Task API ([apps-script/Code.gs](apps-script/Code.gs))

The script exposes `doGet` (list) and `doPost` (create / update / delete) over a sheet tab called **`Timer`**. It finds columns by **header name**, so the column order doesn't matter:

```
ticket id, Task title, Task description, task date time, task duration,
task priority, task category, ticket type, task status, user name,
user type, log time, sync calendar, reminder minutes, calendar event id
```

The three calendar columns are added automatically the first time a task is created or updated. The script owns `calendar event id`, and the client never sends it.

**Setting up your own backend:**

1. Create a Google Sheet with a tab named `Timer` and the headers above in row 1.
2. Open **Extensions → Apps Script** and paste in the contents of `apps-script/Code.gs`.
3. Optionally, set the config values at the top of the script:
   - `SPREADSHEET_ID`: only needed if the script is a standalone project, not bound to the sheet.
   - `CALENDAR_ID`: leave it empty to use your primary calendar.
   - `DEFAULT_REMINDER_MINUTES`: 30 by default.
4. Click **Deploy → New deployment → Web app**. Set *Execute as* to **Me** and *Who has access* to **Anyone**.
5. Copy the `/exec` URL into `API_URL` in [src/lib/api.js](src/lib/api.js).

### Dev Resources API

[src/Components/devResourcesApi.js](src/Components/devResourcesApi.js) talks to a second Apps Script that stores resources in a "Resource Sheet". Rows are matched by `resource_url` for update and delete:

| Request | Effect |
|---|---|
| `GET API_URL` | All rows |
| `POST { ...fields }` | Create |
| `POST { action: "update", resource_url, ... }` | Update the matching row |
| `POST { action: "delete", resource_url }` | Delete the matching row |

---

## Task model

In the app, tasks use camelCase fields. All conversion to and from sheet column names happens in [src/lib/sheet-mapper.js](src/lib/sheet-mapper.js). That file also reads older "legacy" rows whose columns are shifted by one.

| Field | Notes |
|---|---|
| Title, description | Free text |
| Date | `yyyy-MM-dd` |
| Start time (`startHour`) | Decimal hours, in 15-minute steps (96 slots per day) |
| Duration | Hours, at least 0.25 |
| Priority | `low`, `medium`, `high` |
| Category | `work`, `personal`, `learning`, `entertainment`, `ashtro`, `health`, `other` (each has its own colour) |
| Status | `pending`, `ongoing`, `completed` (aliases like `done` and `in-progress` are normalised) |
| Ticket type | Free classification |
| Sync calendar | On/off. When on, the task is pushed to Google Calendar |
| Reminder minutes | 30 by default, up to 4 weeks (40320) |

Slot maths, overlap detection and `formatHour()` live in [src/lib/types.js](src/lib/types.js).

---

## Authentication

[AuthContext.jsx](src/Components/authentication/AuthContext.jsx) is a **client-only** auth layer. Users and the session are stored in `localStorage` (`taskplanner.auth.users`, `taskplanner.auth.session`). [PrivateRoute.jsx](src/Components/authentication/PrivateRoute.jsx) sends you to `/login` when there is no session.

### Accounts and roles

| | Admin | Demo (demo account and every sign-up) |
|---|---|---|
| Account | The owner's account. It isn't shown on the login page, and only a SHA-256 hash of its password is in the source. | `demo@ashtro.dev` / `Demo@123`, shown on the login page |
| Task data | Real Google Sheet, through Apps Script | Dummy tasks from [src/data/demo-tasks.json](src/data/demo-tasks.json) |
| Saving changes | Written to the sheet | Kept in `sessionStorage`. They survive a refresh and are discarded on sign-out or when the tab closes. |
| Google Calendar sync | ✅ | ❌ (the checkbox is disabled) |
| Time Planner, Project Tracker, To-Do, Home, Notifications | ✅ | ✅ |
| Nec Doc, Dev Resources Admin | ✅ | ❌ (hidden from the nav, and the route shows "Admin access only") |

- The role is worked out from the account's email (`withRole()` in `AuthContext.jsx`). Only the admin email gets `admin`, and everything else gets `demo`. Components read it with `useAuth().isAdmin` / `isDemo`.
- [time-tracking-context.js](src/lib/time-tracking-context.js) picks the data source by role. Demo accounts never call `lib/api.js`. Demo data loads through [src/lib/demo-data.js](src/lib/demo-data.js), which turns each task's `dayOffset` into a real date, so the demo always shows the current week.
- Admin-only pages are wrapped in [AdminRoute.jsx](src/Components/authentication/AdminRoute.jsx) and flagged with `adminOnly: true` in [src/lib/navigation.js](src/lib/navigation.js).
- When anyone signs out, the demo sandbox and the cached sheet data (`taskplanner:tasks`) are both cleared.

To change the demo data, edit `src/data/demo-tasks.json`. Each entry takes `dayOffset` (days from today), `startHour`, `duration`, `name`, `description`, `category`, `priority` and `status`.

> ⚠️ This is **not real security**. Everything runs in the browser: sign-up passwords are stored in plain text in localStorage, and the Apps Script endpoints are public URLs in the JS bundle. The demo restrictions stop the UI from using real data, but anyone who reads the bundle can still call the endpoints directly. It's fine for a personal tool, but don't put sensitive data in it.

---

## Notifications

[src/lib/notify.js](src/lib/notify.js) is a plain store with no React dependency, so you can call it from anywhere: components, contexts or API helpers.

```js
notify.success("Task saved");
notify.error("Couldn't save", { description: "Check your connection.", save: true });
notify.promise(saveTask(), {
  loading: "Saving…",
  success: "Saved",
  error: (err) => err.message,
});
```

Options: `description`, `duration` (ms, or `Infinity`), `action` (`{ label, onClick }`), `id` (update a toast in place), `save` (also add it to the bell inbox), and `href` (the page to open when the saved notification is clicked). Toasts are rendered by `<Toaster />`, and the inbox is stored per user.

---

## Design system

The look is dark and focused: near-black surfaces, a deep wine brand colour and a cyan "glow" accent. Colours are defined as RGB CSS variables in [src/index.css](src/index.css) and exposed as Tailwind colours in [tailwind.config.js](tailwind.config.js). For example, `bg-card`, `text-muted-foreground`, `bg-primary`, `text-accent` and `ring-glow`.

- **Fonts:** Fraunces (`font-display`) for headings and the brand, the system sans stack for UI text.
- **Custom animations:** `animate-ripple`, `animate-fade-up`, `animate-aurora`, `animate-glow-pulse`.
- **Custom breakpoints:** `sm` 350px, `md` 640px, `lg` 768px, `xl` 1024px, `2xl` 1280px. These are smaller than Tailwind's defaults.
- **Inspiration:** the mockups in [Insfireup/](Insfireup/).

The full token table and layout rules are in [docs/design.md](docs/design.md).

---

## Deployment

The app uses `HashRouter`, so it runs on any static host (GitHub Pages, Netlify, Vercel, S3) without server rewrites.

```bash
npm run build        # → build/   (CRA)
# or
npm run build-web    # → dist/    (webpack)
```

Upload the output folder to your host. For a sub-path deployment with webpack, set `PUBLIC_URL` before you build.

---

## Known limitations

- Auth is local to the browser and not secure (see [Authentication](#authentication)).
- The Apps Script URLs are hard-coded in `src/lib/api.js` and `src/Components/devResourcesApi.js`. They are not environment variables yet.
- `user name` and `user type` are hard-coded in `sheet-mapper.js` instead of coming from the logged-in user.
- The default CRA test in `src/App.test.js` looks for "learn react" and fails.
- There are two build systems (CRA and webpack) in parallel.
- The `package.json` version (0.1.2) doesn't match the app version (v2.0.11).

---

## Roadmap

- Real authentication (for example, Google sign-in, since the backend is already Google)
- Move the API URLs into `REACT_APP_*` environment variables
- Dashboard stat cards (total tasks, hours planned, completion rate)
- Goals page and an analytics/productivity overview
- Task search
- Settle on one build system

The full backlog is in [docs/tasks.md](docs/tasks.md).

---

## Further documentation

| Doc | Contents |
|---|---|
| [docs/prd.md](docs/prd.md) | Product requirements, goals, non-goals, success criteria |
| [docs/architecture.md](docs/architecture.md) | Stack, data flow, sheet schema, providers |
| [docs/design.md](docs/design.md) | UI/UX direction, colour tokens, typography, layout |
| [docs/rules.md](docs/rules.md) | Coding conventions for contributors |
| [docs/tasks.md](docs/tasks.md) | Progress tracker and backlog |
| [src/changelog.md](src/changelog.md) | Version history |

---

## Author

**Anush Serrao** · [Ashtro Dev](https://ashserrao.github.io/portfolio/) · [GitHub](https://github.com/ashserrao) · [LinkedIn](https://www.linkedin.com/in/anush-serrao-31440a16a/)

© 2026 Ashtro Dev. All rights reserved.
