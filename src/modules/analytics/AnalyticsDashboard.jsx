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
import { motion } from 'framer-motion';

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];
const CHART_COLORS = {
  primary: '#2dd4bf', // brand-400
  secondary: '#14b8a6', // brand-500
  success: '#10b981',
  background: '#0f172a', // surface-900
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
      <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <p className="text-sm font-semibold text-white">
            {entry.name}: <span className="font-display font-bold">{entry.value}</span>
          </p>
        </div>
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
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="glass-panel p-12 text-center text-surface-500">Failed to load analytics</div>;

  const last7Days = getLastNDaysISO(7);
  const weeklyHabitData = last7Days.map((date) => {
    const log = data.weeklyHabitLogs.find((l) => l.date === date);
    return { day: getDayName(date), completions: log ? log.completions : 0 };
  });

  const taskPriorityData = data.tasksByPriority.map((t) => ({
    name: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
    value: t.count,
  }));

  const dailyTaskChartData = last7Days.map((date) => {
    const d = data.dailyTaskData.find((t) => t.date === date);
    return { day: getDayName(date), completed: d ? d.completed : 0, total: d ? d.total : 0 };
  });

  const stats = [
    { label: 'Total Tracked Habits', value: data.totalHabits, icon: HiOutlineCheckCircle, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Total Logged Tasks', value: data.totalTasks, icon: HiOutlineClipboardList, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Habit Completion Rate', value: `${data.habitCompletionRate}%`, icon: HiOutlineFire, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Tasks Completed 7D', value: data.completedTasks, icon: HiOutlineTrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 flex flex-col items-start gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shadow-glass`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6">
          <h3 className="text-sm font-bold text-white mb-6 font-display tracking-wide uppercase">Weekly Habit Completions</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyHabitData}>
              <defs>
                <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="completions" stroke={CHART_COLORS.primary} strokeWidth={3} fill="url(#habitGradient)" name="Completions" activeDot={{ r: 6, fill: CHART_COLORS.primary, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-6">
          <h3 className="text-sm font-bold text-white mb-6 font-display tracking-wide uppercase">Daily Task Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyTaskChartData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="completed" fill={CHART_COLORS.success} radius={[6, 6, 6, 6]} name="Completed" />
              <Bar dataKey="total" fill="rgba(255,255,255,0.1)" radius={[6, 6, 6, 6]} name="Total Created" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {taskPriorityData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-panel p-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-white mb-6 font-display tracking-wide uppercase">Tasks by Priority</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={taskPriorityData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                    {taskPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
