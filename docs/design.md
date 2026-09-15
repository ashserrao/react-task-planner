# UI/UX Direction

## Mood

A dark, focused and slightly dramatic look. Near-black surfaces, deep maroon/wine as the brand colour, and cyan as the "glow" accent. Calm by default, with motion used only as feedback.

Reference screenshots of the target dashboard style (sidebar nav, stat cards, daily timeline, streak and productivity panels) are in [`Insfireup/`](../Insfireup/).

## Colour tokens

Defined as RGB triplets in `src/index.css` and exposed as Tailwind colours in `tailwind.config.js`.

| Token | RGB | Use |
|---|---|---|
| `background` | 6 6 8 | Page background |
| `foreground` | 232 232 226 | Body text |
| `card` | 20 13 13 | Cards, panels |
| `border` / `input` | 63 45 45 | Dividers, field borders |
| `primary` | 122 41 56 | Brand wine: primary buttons, active tab |
| `secondary` | 32 22 22 | Hover surfaces |
| `muted-foreground` | 176 168 163 | Secondary text |
| `accent` | 103 199 235 | Links, hover highlight (`#67C7EB`) |
| `glow` | 140 252 251 | Active nav item, focus/pulse (`#8cfcfb`) |
| `badge` | 44 22 26 | Badge background |
| `destructive` | 239 68 68 | Delete, errors |

The shell (`portfolio.jsx`) still uses some raw hex values: header `#6A0C0B`, mobile menu `#582726` and nav text `#c2ccaa`. New code should use the tokens.

Category colours (sky, emerald, …) come from `TASK_CATEGORIES` in `src/lib/types.js`. They use a `/20` tint for backgrounds and a `-300` shade for text.

## Typography

- Display and brand text: **Fraunces** (`font-display`), used for the app title and page headings.
- UI text: the system sans stack.
- Labels are lowercase in the nav (`time-planner`, `todo-list`) and use the `capitalize` style.

## Layout

- Fixed top header with a blurred translucent bar. On mobile it collapses to a full-screen menu.
- Content sits in a centred `container` with `px-4` on mobile and `px-6` from `sm` up.
- Sticky footer with the copyright, version and social links.
- `HiveBackground` (a hexagon pattern) is the signature decorative backdrop on Home, To-Do, Projects and Hobbies.

## Components

- **Cards:** `bg-card`, `border-border`, rounded-xl.
- **Tab/segmented control:** see the view switcher in `timeplanner.jsx`. The active tab is `bg-primary`.
- **Task card:** coloured by category and draggable (dnd-kit). `MiniTaskCard` is the compact version for the calendar.
- **Task form:** a dialog (`task-form-dialog.jsx`) for both create and edit.
- **Toasts:** use the notification service, with success and failure variants.

## Motion

- framer-motion `whileHover={{ scale: 1.1 }}` and `whileTap={{ scale: 0.95 }}` on nav and buttons.
- Tailwind keyframes: `fadeUp` (content entry), `ripple` (click), `aurora` (background drift), `glowPulse` (attention).
- Keep animations short (≤ 500 ms), and never block input.

## Accessibility

- Toggle buttons use `aria-pressed`. Icon-only buttons need an `aria-label`.
- Keep text contrast at WCAG AA on the dark surfaces. Muted text on `card` is the riskiest pair.
- Everything should be reachable by keyboard, including dialogs and dropdowns.
