import { useAppStore } from './store/appStore';
import Sidebar from './components/Sidebar';
import HabitTracker from './modules/habits/HabitTracker';
import TaskManager from './modules/tasks/TaskManager';
import AnalyticsDashboard from './modules/analytics/AnalyticsDashboard';
import AICommandInterface from './components/AICommandInterface';
import Settings from './components/Settings';
import { Toaster } from 'react-hot-toast';

const TABS = {
  habits: HabitTracker,
  tasks: TaskManager,
  analytics: AnalyticsDashboard,
  ai: AICommandInterface,
  settings: Settings,
};

export default function App() {
  const { activeTab, sidebarCollapsed } = useAppStore();
  const ActiveComponent = TABS[activeTab] || HabitTracker;

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-brand-500/[0.03] blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/[0.03] blur-[120px]" />
      </div>

      <Sidebar />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        <div className="p-8 max-w-6xl mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-surface-600 font-medium uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span className="text-xs text-surface-500">Local</span>
            </div>
          </div>

          <ActiveComponent />
        </div>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-surface-900 !text-white !border !border-white/10 !shadow-xl',
          duration: 3000,
        }}
      />
    </div>
  );
}
