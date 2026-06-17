# LifeTracker — Build Plan

## Stack
- **Framework**: React 18 + Vite + TypeScript
- **UI**: Shadcn/ui + Tailwind CSS (Shadcn requires Tailwind)
- **Data**: Local `data.json` — edit on PC, commit, push to GitHub Pages
- **Deployment**: GitHub Pages via `vite build` + `gh-pages` package

---

## Phase 1 — Project Scaffolding

1. Init Vite + React + TypeScript project
2. Install and configure Tailwind CSS
3. Install and init Shadcn/ui (`npx shadcn-ui@latest init`)
4. Add `gh-pages` for deployment, configure `vite.config.ts` base path
5. Set up folder structure:
   ```
   src/
     components/    # UI components
     data/          # data.json lives here
     types/         # TypeScript interfaces
     lib/           # utility functions (cost rollup, deadline logic)
     App.tsx
   ```

---

## Phase 2 — Data Schema

`public/data.json` — single file, array of projects.

```json
[
  {
    "id": "uuid",
    "title": "House Rent",
    "deadline": "2027-01-01",
    "notes": "",
    "tasks": [
      {
        "id": "uuid",
        "title": "Get the owner contact",
        "deadline": "2027-01-01",
        "estimatedDays": 5,
        "cost": 0,
        "currency": "DZD",
        "status": "pending",
        "notes": "",
        "delayedBy": 0,
        "tasks": []
      }
    ]
  }
]
```

**Rules baked into the schema:**
- `tasks` is recursive — infinite nesting
- `delayedBy` (days) propagates up: a delayed child shifts the parent deadline
- `status`: `"pending"` | `"in-progress"` | `"done"` | `"delayed"`

---

## Phase 3 — Core Logic (lib/)

### `rollupCosts(project)`
Recursively sum costs from all nested tasks up to the project level.

### `propagateDeadlines(tasks)`
If any task has `delayedBy > 0`, bubble the delay up to its parent and then to the project. Project shows both:
- **Expected deadline** (original)
- **Current deadline** (original + max delay in chain)

### `flattenTimeline(project)`
Produce a flat ordered list of tasks sorted by deadline for the timeline view.

---

## Phase 4 — Components

| Component | Description |
|---|---|
| `ProjectCard` | Top-level project summary: title, deadline pair, total cost, progress bar |
| `TaskTree` | Recursive component rendering nested tasks at any depth |
| `TaskRow` | Single task: title, status badge, deadline, estimated time, cost, notes toggle |
| `NotesPanel` | Expandable notes section under any task or project |
| `TimelineSidebar` | Chronological list of all tasks across all projects sorted by deadline |
| `CostSummary` | Per-project and grand total cost display |
| `DeadlineStatus` | Shows expected vs current (delayed) deadline side by side |

---

## Phase 5 — Pages / Views

### Dashboard (default)
- Grid of `ProjectCard` components
- Grand total cost across all projects
- Next upcoming deadline callout

### Project Detail
- Full `TaskTree` for one project
- `DeadlineStatus` banner at the top
- `CostSummary` sidebar

### Timeline View
- All tasks across all projects in chronological order
- Color-coded by status and urgency (overdue = red, due soon = yellow)

---

## Phase 6 — GitHub Pages Deployment

1. In `vite.config.ts`, set `base: '/TODO/'` (or your repo name)
2. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "vite build && gh-pages -d dist"
   }
   ```
3. Push `data.json` updates → run `npm run deploy` → live in ~1 min

---

## Build Order

1. [ ] Scaffold (Phase 1)
2. [ ] Define TypeScript types for schema (Phase 2)
3. [ ] Write utility functions with unit tests (Phase 3)
4. [ ] Build `TaskTree` + `TaskRow` (Phase 4)
5. [ ] Build `ProjectCard` + Dashboard view (Phase 5)
6. [ ] Build Project Detail view (Phase 5)
7. [ ] Build Timeline view (Phase 5)
8. [ ] Wire up deployment (Phase 6)
9. [ ] Populate `data.json` with real data
10. [ ] Deploy to GitHub Pages

---

## Out of Scope (for now)
- Authentication (not needed, personal app)
- In-browser editing UI (data edited via JSON directly)
- Backend / database (static only)
