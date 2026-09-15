# Coding Rules

These rules follow the conventions already used in the codebase. When a rule and the existing code disagree, raise it and don't silently diverge.

## General

- JavaScript plus JSX (no TypeScript). Function components and hooks only.
- Keep components in `src/Components/`, shared UI primitives in `src/Components/ui/`, and non-UI logic in `src/lib/`.
- File names: feature components are lowercase (`todo.jsx`, `projecttracker.jsx`). UI primitives are kebab-case (`task-card.jsx`). Match the folder you're in.
- Use named exports for UI primitives and lib functions. Pages use a default export.
- Use 2-space indentation, double quotes, semicolons and trailing commas (Prettier defaults).

## State and data

- All task reads and writes go through `useTimeTracking()`. Components never call `fetch` or `lib/api.js` directly.
- All sheet field naming lives in `lib/sheet-mapper.js`. The rest of the app only uses camelCase task fields (`name`, `startHour`, `duration`, …).
- Never send `calendar event id` from the client, because the Apps Script owns it.
- Update and delete require `rowNumber`. Keep it on task objects.
- POSTs to Apps Script must use `Content-Type: text/plain;charset=utf-8` to avoid a CORS preflight.
- Treat any `{ result: "error" }`, `{ error }` or `{ success: false }` response as a failure and throw.
- Report user-visible outcomes with `notify.success / .error / .warning / .info / .promise` from `lib/notify.js`. Pass `{ save: true }` to also add the notification to the bell's inbox (do this for failures).
- Wrap every `localStorage` read and parse in `try/catch` with a safe fallback.

## Dates and time

- Use `date-fns` for all date maths and formatting. Dates are passed as `yyyy-MM-dd` strings.
- `startHour` is a decimal hour and `duration` is in hours. Slots are 15 minutes (`TIME_SLOTS` in `lib/types.js`).
- Use `formatHour()` for display, not hand-rolled formatting.

## Styling

- Use Tailwind utilities. Merge conditional classes with `cn()` from `lib/utils.js`.
- Prefer semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`) over raw hex. See [design.md](design.md).
- Category, priority and status colours come from `lib/types.js` (`TASK_CATEGORIES`, `PRIORITY_CONFIG`, `STATUS_CONFIG`). Don't redefine them per component.
- Every view must work at 375 px with no horizontal scroll (use `min-w-0` on flex children).

## Comments

- Comment the **why** (quirks, legacy data, API limits), not the what. The comments in `sheet-mapper.js` and `devResourcesApi.js` are the model.

## Secrets and config

- Apps Script URLs are currently hard-coded. Don't add new secrets to source. Put new config in `.env.local` (git-ignored) as `REACT_APP_*`.

## Process

- Add an entry to `src/changelog.md` for every version bump, and keep the footer version in `portfolio.jsx` in sync.
- Run `npm run build` before committing to catch compile errors.
