import { format, isToday, isTomorrow, isPast, parseISO, differenceInDays } from 'date-fns';

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d, yyyy');
}

export function isOverdue(dateString) {
  if (!dateString) return false;
  const date = parseISO(dateString);
  return isPast(date) && !isToday(date);
}

export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

export function getLastNDaysISO(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function calculateStreak(logs, habitId) {
  const habitLogs = logs
    .filter((l) => l.habit_id === habitId)
    .map((l) => l.date)
    .sort()
    .reverse();

  if (habitLogs.length === 0) return 0;

  let streak = 0;
  const today = getTodayISO();
  let checkDate = today;

  for (let i = 0; i < 365; i++) {
    if (habitLogs.includes(checkDate)) {
      streak++;
    } else if (checkDate !== today) {
      break;
    }
    const d = new Date(checkDate);
    d.setDate(d.getDate() - 1);
    checkDate = d.toISOString().split('T')[0];
  }

  return streak;
}

export function getDayName(dateString) {
  return format(parseISO(dateString), 'EEE');
}
