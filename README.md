# LifeTracker

A personal life-planning dashboard for tracking major projects with nested tasks, deadlines, costs, and timelines. Runs as a static site on GitHub Pages.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A GitHub repository with Pages enabled

## Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/TODO.git
cd TODO

# Install dependencies
npm install
```

## Local Development

```bash
npm run dev
```

Open `http://localhost:5173/TODO/` in your browser.

## Adding / Updating Data

All projects and tasks live in `public/data.json`. Edit that file directly on your PC, then redeploy.

**Schema overview:**

```json
[
  {
    "id": "unique-id",
    "title": "Project name",
    "deadline": "YYYY-MM-DD",
    "notes": "Optional project notes",
    "tasks": [
      {
        "id": "unique-id",
        "title": "Task name",
        "deadline": "YYYY-MM-DD",
        "estimatedDays": 5,
        "cost": 0,
        "status": "pending",
        "notes": "",
        "delayedBy": 0,
        "tasks": []
      }
    ]
  }
]
```

**Field reference:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (use a slug or UUID) |
| `deadline` | string | ISO date `YYYY-MM-DD` |
| `estimatedDays` | number | How many days the task is expected to take |
| `cost` | number | Cost in DZD (use `0` if free) |
| `status` | string | `pending` · `in-progress` · `done` · `delayed` |
| `delayedBy` | number | Days the task has slipped — propagates up to the project deadline automatically |
| `tasks` | array | Nested sub-tasks (infinite depth) |

## Deployment to GitHub Pages

### First-time setup

1. Push the repo to GitHub if you haven't already:

   ```bash
   git remote add origin https://github.com/<your-username>/TODO.git
   git push -u origin main
   ```

2. In your GitHub repo, go to **Settings → Pages** and set the source to the `gh-pages` branch.

### Deploy

```bash
npm run deploy
```

This builds the app and pushes the `dist/` folder to the `gh-pages` branch. Your site will be live at:

```
https://<your-username>.github.io/TODO/
```

### Update workflow

1. Edit `public/data.json` on your PC
2. Run `npm run deploy`
3. Changes are live within ~1 minute

## Build Only (no deploy)

```bash
npm run build
```

Output goes to `dist/`. You can preview it locally with:

```bash
npm run preview
```
