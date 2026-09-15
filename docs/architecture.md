# Architecture

## Stack

- **React 18** (function components and hooks), **React Router 7** using `HashRouter` so it works on static hosting such as GitHub Pages.
- **Tailwind CSS 3** with design tokens as CSS variables (`src/index.css`, `tailwind.config.js`).
- **framer-motion** for animation, **lucide-react** and **react-icons** for icons, **date-fns** for dates, **@dnd-kit** for drag and drop, **react-markdown** with **remark-gfm** for resource notes.
- **Backend:** Google Apps Script web apps over Google Sheets, plus Google Calendar.

### Builds

There are two parallel build setups:

| Command | Tool | Output |
|---|---|---|
| `npm start` / `npm run build` | Create React App (`react-scripts`) | `build/` |
| `npm run start-web` / `npm run build-web` | Custom webpack (`webpack.config.js`, `.babelrc`, `postcss.config.js`) | `dist/` |

## Directory layout

```
apps-script/Code.gs        Apps Script backend for tasks (sheet "Timer")
docs/                      Project documentation (this folder)
Insfireup/                 UI inspiration screenshots
public/                    index.html, favicon, logo, manifest
src/
  index.js                 Entry point: HashRouter > App
  App.js                   Providers: Auth > Notification > TimeTracking > Portfolio
  portfolio.jsx            App shell: navbar, routes, footer
  changelog.md             Version history
  Components/
    authentication/        AuthContext, PrivateRoute, login/signup UI
    ui/                    Shared primitives (button, badge, dropdown, task-card,
                           task-form-dialog, notification-service, collapsible)
    home.jsx               Home page (HiveBackground + HobbyTracker)
    timeplanner.jsx        View switcher: timeline / calendarview / listview
    projecttracker.jsx     Category-as-project tracker
    todo.jsx               Daily to-do list
    hobbytracker.jsx       Habits, streaks, heatmap
    devresadmin.jsx        Dev resources CRUD UI
    devResourcesApi.js     Client for the Resource Sheet Apps Script
    HiveBackground.jsx     Decorative hexagon background
  lib/
    api.js                 Client for the Task Apps Script
    sheet-mapper.js        Converts between sheet rows and the app's task objects
    time-tracking-context.js  Task state, CRUD and localStorage cache
    types.js               Time slots, categories, priority/status config
    utils.js               cn() helper (clsx + tailwind-merge)
```

## Data flow (tasks)

```
UI component
  -> useTimeTracking()                 (lib/time-tracking-context.js)
     -> api.js  fetchTasks / create / update / delete
        -> sheet-mapper.js  toSheetRow / fromSheetRow
           -> fetch(API_URL)           Apps Script web app (apps-script/Code.gs)
              -> Google Sheet "Timer"  (+ Google Calendar when "sync calendar" is on)
```

- **Reads:** `GET ?action=list` returns every row, each with a generated `rowNumber`.
- **Writes:** `POST` with a `text/plain` body (`{ action, ...fields }`). Using `text/plain` avoids a CORS preflight, which Apps Script cannot answer.
- **Row identity:** update and delete need `rowNumber`. `ticket id` is sent too when it exists.
- **Errors:** the script can return HTTP 200 with `{ result: "error" }` or `{ error }`. The clients turn that into a thrown `Error`.
- **Calendar:** a response can include `calendarError`. The sheet save still counts as successful, and a failure toast is shown.
- **Cache:** tasks are kept in `localStorage["taskplanner:tasks"]` so the first render is instant, then refreshed from the API.

### Sheet schema (task sheet)

The script finds columns by header name, so their order does not matter:

`ticket id, Task title, Task description, task date time, task duration, task priority, task category, ticket type, task status, user name, user type, log time, sync calendar, reminder minutes, calendar event id`

`calendar event id` is owned by the script. The client never sends it. `sheet-mapper.js` also reads **legacy rows** that were saved before `ticket id` and `ticket type` existed and are shifted one column; the comments in that file explain the mapping.

## Dev Resources

`devResourcesApi.js` talks to a second Apps Script ("Resource Sheet"). Rows are matched by `resource_url` for update and delete.

## Authentication

`AuthContext.jsx` is a **client-only** auth layer. Users and the session are stored in localStorage (`taskplanner.auth.users`, `taskplanner.auth.session`), and a demo account is built in. `PrivateRoute` redirects to `/login` when there is no session. This is not real security, and the Apps Script endpoints are public.

## Global providers

| Provider | Hook | Responsibility |
|---|---|---|
| `AuthProvider` | `useAuth()` | Login, logout, sign-up, `isAuthenticated` |
| `NotificationProvider` | `useNotifications()` | Mounts the `<Toaster />` and points the inbox at the signed-in user. The service itself is the plain store `lib/notify.js` (`notify.success(...)` etc.), which can be called from anywhere. |
| `TimeTrackingProvider` | `useTimeTracking()` | Tasks, `selectedDate`, CRUD, `getTasksForDate`, `getAllTasks` |
