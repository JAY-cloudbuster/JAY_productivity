import { useAppStore } from './store/appStore';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './modules/overview/OverviewDashboard';
import HabitTracker from './modules/habits/HabitTracker';
import TaskManager from './modules/tasks/TaskManager';
import FocusMode from './modules/focus/FocusMode';
import Notes from './modules/notes/Notes';
import AnalyticsDashboard from './modules/analytics/AnalyticsDashboard';
import AICommandInterface from './components/AICommandInterface';
import Settings from './components/Settings';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = {
  overview: OverviewDashboard,
  habits: HabitTracker,
  tasks: TaskManager,
  focus: FocusMode,
  notes: Notes,
  analytics: AnalyticsDashboard,
  ai: AICommandInterface,
  settings: Settings,
};

export default function App() {
  const { activeTab, sidebarCollapsed } = useAppStore();
  const ActiveComponent = TABS[activeTab] || OverviewDashboard;

  return (
    <div className="min-h-screen bg-magic font-sans text-surface-50 overflow-x-hidden selection:bg-brand-500/30 selection:text-brand-100">
      {/* Immersive Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-60">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-500/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[130px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[30%] w-[30vw] h-[30vw] rounded-full bg-purple-500/5 blur-[100px] animate-float" />
      </div>

      <Sidebar />

      <main
        className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen
          ${sidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'} pt-16 md:pt-0`}
      >
        <div className="p-4 sm:p-8 md:p-12 max-w-[1400px] mx-auto min-h-screen flex flex-col relative z-10 w-full overflow-hidden">
          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col"
            >
              <h2 className="text-3xl font-display font-bold text-white capitalize tracking-tight flex items-center gap-3">
                {activeTab.replace('-', ' ')}
                <div className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-glow-brand" />
              </h2>
              <p className="text-sm text-surface-400 font-medium mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-panel px-4 py-2 flex items-center gap-3 rounded-full"
            >
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500 shadow-glow-brand"></span>
              </div>
              <span className="text-xs font-bold text-brand-100 uppercase tracking-widest">Local Mode</span>
            </motion.div>
          </header>

          {/* Dynamic Content Area */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full"
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-surface-900/90 !backdrop-blur-xl !text-white !border !border-white/10 !shadow-2xl !rounded-2xl',
          duration: 4000,
        }}
      />
    </div>
  );
}
