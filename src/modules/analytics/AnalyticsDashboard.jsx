import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { getLastNDaysISO, getDayName } from '../../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineFire,
  HiOutlineTrendingUp,
} from 'react-icons/hi';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];
const CHART_COLORS = {
  primary: '#5c7cfa',
  secondary: '#748ffc',
  success: '#22c55e',
  gradient1: '#4c6ef5',
  gradient2: '#748ffc',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900/95 backdrop-blur-lg border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-surface-400">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await api.getAnalytics();
        setData(analytics);
      } catch (err) {
        console.error('Analytics fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-surface-500">Failed to load analytics</p>
      </div>
    );
  }

  const last7Days = getLastNDaysISO(7);
  const weeklyHabitData = last7Days.map((date) => {
    const log = data.weeklyHabitLogs.find((l) => l.date === date);
    return {
      day: getDayName(date),
      completions: log ? log.completions : 0,
    };
  });

  const taskPriorityData = data.tasksByPriority.map((t) => ({
    name: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
    value: t.count,
  }));

  const dailyTaskChartData = last7Days.map((date) => {
    const d = data.dailyTaskData.find((t) => t.date === date);
    return {
      day: getDayName(date),
      completed: d ? d.completed : 0,
      total: d ? d.total : 0,
    };
  });

  const stats = [
    {
      label: 'Total Habits',
      value: data.totalHabits,
      icon: HiOutlineCheckCircle,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
    },
    {
      label: 'Total Tasks',
      value: data.totalTasks,
      icon: HiOutlineClipboardList,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Habit Rate',
      value: `${data.habitCompletionRate}%`,
      icon: HiOutlineFire,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Tasks Done',
      value: data.completedTasks,
      icon: HiOutlineTrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-surface-500 mt-1 text-sm">Your productivity insights at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card animate-slide-up">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-surface-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit completion chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Habit Completions</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyHabitData}>
              <defs>
                <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#868e96', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#868e96', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="completions"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fill="url(#habitGradient)"
                name="Completions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task completion chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Daily Task Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyTaskChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#868e96', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#868e96', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="total" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Total" opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority distribution */}
      {taskPriorityData.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Tasks by Priority</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={taskPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {taskPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ color: '#adb5bd', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
