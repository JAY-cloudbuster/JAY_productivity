import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { getDb, queryAll, queryOne, queryCount, runSql } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── HABITS ────────────────────────────────────────────
app.get('/api/habits', (req, res) => {
  try {
    const habits = queryAll('SELECT * FROM habits ORDER BY created_at DESC');
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits', (req, res) => {
  try {
    const { name, frequency = 'daily' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Habit name is required' });
    }
    const id = uuidv4();
    runSql('INSERT INTO habits (id, name, frequency) VALUES (?, ?, ?)', [id, name.trim(), frequency]);
    const habit = queryOne('SELECT * FROM habits WHERE id = ?', [id]);
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/habits/:id', (req, res) => {
  try {
    const { id } = req.params;
    runSql('DELETE FROM habit_logs WHERE habit_id = ?', [id]);
    const result = runSql('DELETE FROM habits WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HABIT LOGS ────────────────────────────────────────
app.get('/api/habits/:id/logs', (req, res) => {
  try {
    const { id } = req.params;
    const logs = queryAll('SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY date DESC', [id]);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/habit-logs', (req, res) => {
  try {
    const logs = queryAll('SELECT * FROM habit_logs ORDER BY date DESC');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits/:id/log', (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    const logDate = date || new Date().toISOString().split('T')[0];

    const habit = queryOne('SELECT * FROM habits WHERE id = ?', [id]);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const existing = queryOne('SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?', [id, logDate]);
    if (existing) {
      runSql('DELETE FROM habit_logs WHERE id = ?', [existing.id]);
      return res.json({ logged: false, date: logDate });
    }

    const logId = uuidv4();
    runSql('INSERT INTO habit_logs (id, habit_id, date) VALUES (?, ?, ?)', [logId, id, logDate]);
    res.status(201).json({ logged: true, date: logDate, id: logId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TASKS ─────────────────────────────────────────────
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = queryAll('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, priority = 'medium', due_date = null } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    const id = uuidv4();
    runSql('INSERT INTO tasks (id, title, priority, due_date) VALUES (?, ?, ?, ?)', [id, title.trim(), priority, due_date]);
    const task = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, priority, due_date } = req.body;

    const task = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTitle = title !== undefined ? title : task.title;
    const updatedPriority = priority !== undefined ? priority : task.priority;
    const updatedStatus = status !== undefined ? status : task.status;
    const updatedDueDate = due_date !== undefined ? due_date : task.due_date;

    runSql('UPDATE tasks SET title = ?, priority = ?, status = ?, due_date = ? WHERE id = ?',
      [updatedTitle, updatedPriority, updatedStatus, updatedDueDate, id]);

    const updated = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = runSql('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ANALYTICS ─────────────────────────────────────────
app.get('/api/analytics', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const totalHabits = queryCount('SELECT COUNT(*) as count FROM habits');
    const totalTasks = queryCount('SELECT COUNT(*) as count FROM tasks');
    const completedTasks = queryCount("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
    const pendingTasks = queryCount("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'");

    const weeklyHabitLogs = queryAll(`
      SELECT date, COUNT(*) as completions
      FROM habit_logs
      WHERE date >= ?
      GROUP BY date
      ORDER BY date ASC
    `, [sevenDaysAgo]);

    const totalLogsThisWeek = queryCount('SELECT COUNT(*) as count FROM habit_logs WHERE date >= ?', [sevenDaysAgo]);
    const maxPossibleLogs = totalHabits * 7;
    const habitCompletionRate = maxPossibleLogs > 0 ? Math.round((totalLogsThisWeek / maxPossibleLogs) * 100) : 0;

    const tasksByPriority = queryAll('SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority');

    const tasksCompletedThisWeek = queryCount(
      "SELECT COUNT(*) as count FROM tasks WHERE status = 'completed' AND created_at >= ?",
      [sevenDaysAgo]
    );

    const dailyTaskData = queryAll(`
      SELECT DATE(created_at) as date,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
             COUNT(*) as total
      FROM tasks
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [sevenDaysAgo]);

    res.json({
      totalHabits,
      totalTasks,
      completedTasks,
      pendingTasks,
      habitCompletionRate,
      weeklyHabitLogs,
      tasksByPriority,
      tasksCompletedThisWeek,
      dailyTaskData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI ENDPOINT ───────────────────────────────────────
app.post('/api/ai/execute', async (req, res) => {
  try {
    const { action, data } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    let result;

    switch (action) {
      case 'create_habit': {
        const { name, frequency = 'daily' } = data || {};
        if (!name) return res.status(400).json({ error: 'Habit name is required' });
        const id = uuidv4();
        runSql('INSERT INTO habits (id, name, frequency) VALUES (?, ?, ?)', [id, name.trim(), frequency]);
        result = queryOne('SELECT * FROM habits WHERE id = ?', [id]);
        break;
      }
      case 'delete_habit': {
        const { name, id: habitId } = data || {};
        let targetId = habitId;
        if (!targetId && name) {
          const habit = queryOne('SELECT id FROM habits WHERE LOWER(name) = LOWER(?)', [name]);
          targetId = habit?.id;
        }
        if (!targetId) return res.status(404).json({ error: 'Habit not found' });
        runSql('DELETE FROM habit_logs WHERE habit_id = ?', [targetId]);
        runSql('DELETE FROM habits WHERE id = ?', [targetId]);
        result = { deleted: true, id: targetId };
        break;
      }
      case 'log_habit': {
        const { name, date, id: habitId } = data || {};
        let targetId = habitId;
        if (!targetId && name) {
          const habit = queryOne('SELECT id FROM habits WHERE LOWER(name) = LOWER(?)', [name]);
          targetId = habit?.id;
        }
        if (!targetId) return res.status(404).json({ error: 'Habit not found' });
        const logDate = date || new Date().toISOString().split('T')[0];
        const logId = uuidv4();
        try {
          runSql('INSERT INTO habit_logs (id, habit_id, date) VALUES (?, ?, ?)', [logId, targetId, logDate]);
          result = { logged: true, date: logDate };
        } catch {
          result = { logged: false, message: 'Already logged for this date' };
        }
        break;
      }
      case 'add_task': {
        const { title, priority = 'medium', due_date = null } = data || {};
        if (!title) return res.status(400).json({ error: 'Task title is required' });
        const id = uuidv4();
        runSql('INSERT INTO tasks (id, title, priority, due_date) VALUES (?, ?, ?, ?)', [id, title.trim(), priority, due_date]);
        result = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
        break;
      }
      case 'complete_task': {
        const { title, id: taskId } = data || {};
        let targetId = taskId;
        if (!targetId && title) {
          const task = queryOne("SELECT id FROM tasks WHERE LOWER(title) = LOWER(?) AND status = 'pending'", [title]);
          targetId = task?.id;
        }
        if (!targetId) return res.status(404).json({ error: 'Task not found' });
        runSql("UPDATE tasks SET status = 'completed' WHERE id = ?", [targetId]);
        result = queryOne('SELECT * FROM tasks WHERE id = ?', [targetId]);
        break;
      }
      case 'analyze_productivity': {
        const totalHabits = queryCount('SELECT COUNT(*) as count FROM habits');
        const totalTasks = queryCount('SELECT COUNT(*) as count FROM tasks');
        const completedTasks = queryCount("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weeklyLogs = queryCount('SELECT COUNT(*) as count FROM habit_logs WHERE date >= ?', [sevenDaysAgo]);
        const maxLogs = totalHabits * 7;
        const habitRate = maxLogs > 0 ? Math.round((weeklyLogs / maxLogs) * 100) : 0;
        const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        result = {
          totalHabits,
          totalTasks,
          completedTasks,
          habitCompletionRate: habitRate,
          taskCompletionRate: taskRate,
          summary: `You have ${totalHabits} habits (${habitRate}% weekly completion) and ${totalTasks} tasks (${taskRate}% completed).`,
        };
        break;
      }
      case 'suggest_schedule': {
        const pending = queryAll("SELECT * FROM tasks WHERE status = 'pending' ORDER BY due_date ASC");
        const habits = queryAll('SELECT * FROM habits');
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const sorted = pending.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));
        result = {
          suggestedSchedule: [
            ...habits.map(h => ({ type: 'habit', name: h.name, time: 'morning' })),
            ...sorted.map((t, i) => ({ type: 'task', title: t.title, priority: t.priority, order: i + 1 })),
          ],
          tip: 'Complete habits first, then tackle high-priority tasks.',
        };
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    res.json({ success: true, action, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize DB then start server
async function start() {
  await getDb();
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
