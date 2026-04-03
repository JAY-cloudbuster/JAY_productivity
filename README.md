# JAY Productivity Dashboard

A local-first, AI-assisted productivity application with habit tracking, task management, and analytics.

## Features

- **Habit Tracker** — Create habits, mark daily completions, track streaks with a 7-day grid
- **Task Manager** — Add tasks with priorities & due dates, filter by today/upcoming/completed
- **Analytics Dashboard** — Weekly habit completion charts, task stats, priority distribution
- **AI Command Interface** — Natural language commands to manage habits & tasks
- **Dark Mode** — Beautiful glassmorphism dark UI
- **Local-First** — All data stored in SQLite on your machine

## Tech Stack

- React + Vite (frontend)
- Tailwind CSS (styling)
- Zustand (state management)
- Recharts (charts)
- Express + better-sqlite3 (backend)
- OpenAI API (optional, for AI commands)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run setup

# 3. Start both frontend & backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## AI Commands

The AI interface supports natural language. Examples:

| Command | Action |
|---------|--------|
| `Create habit Morning Yoga` | Creates a new daily habit |
| `Add task Review PR with high priority` | Creates a high-priority task |
| `Log my Meditation habit` | Marks a habit as done today |
| `Complete task Review PR` | Marks a task as completed |
| `How is my productivity?` | Shows productivity analysis |
| `Suggest a schedule` | Generates a suggested schedule |

### OpenAI API Key (Optional)

Go to **Settings** and paste your OpenAI API key for enhanced AI parsing.  
Without a key, the app uses local pattern matching (limited but functional).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | List all habits |
| POST | `/api/habits` | Create a habit |
| DELETE | `/api/habits/:id` | Delete a habit |
| POST | `/api/habits/:id/log` | Toggle habit log |
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/analytics` | Get analytics data |
| POST | `/api/ai/execute` | Execute AI action |

## Database

SQLite database stored at `data/productivity.db`. Tables:

- `habits` — id, name, frequency, created_at
- `habit_logs` — id, habit_id, date (unique per habit+date)
- `tasks` — id, title, priority, status, due_date, created_at
