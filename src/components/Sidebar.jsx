import { useAppStore } from '../store/appStore';
import { 
  HiOutlineHome, HiOutlineCheckCircle, HiOutlineClipboardList, 
  HiOutlineClock, HiOutlineDocumentText, HiOutlineChartBar, 
  HiOutlineSparkles, HiOutlineCog, HiOutlineMenuAlt2 
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: HiOutlineHome },
  { id: 'habits', label: 'Habits', icon: HiOutlineCheckCircle },
  { id: 'tasks', label: 'Tasks', icon: HiOutlineClipboardList },
  { id: 'focus', label: 'Focus', icon: HiOutlineClock },
  { id: 'notes', label: 'Notes', icon: HiOutlineDocumentText },
  { id: 'analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { id: 'ai', label: 'Assistant', icon: HiOutlineSparkles },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, sidebarCollapsed, toggleSidebar } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (isMobile) setMobileMenuOpen(false);
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-surface-950/80 backdrop-blur-3xl border-b border-white/[0.05] z-50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center shadow-glow-brand/30">
              <span className="text-white font-display font-bold text-xs tracking-widest">JP</span>
            </div>
            <h1 className="text-sm font-display font-bold text-white tracking-tight">JAY OS</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-surface-300 hover:text-white">
            <HiOutlineMenuAlt2 className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Full Screen Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 top-16 z-40 bg-surface-950/95 backdrop-blur-3xl flex flex-col p-6 overflow-y-auto pb-24"
            >
              <nav className="space-y-2">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id} onClick={() => handleNavClick(id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${activeTab === id ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20' : 'text-surface-400 hover:bg-white/[0.02]'} `}
                  >
                    <Icon className={`w-6 h-6 ${activeTab === id ? 'scale-110 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]' : ''}`} />
                    <span className="text-lg">{label}</span>
                  </button>
                ))}
                <button
                  onClick={() => handleNavClick('settings')}
                  className={`w-full flex items-center gap-4 px-5 py-4 mt-6 border-t border-white/5 rounded-2xl font-medium transition-all ${activeTab === 'settings' ? 'text-white bg-white/[0.05]' : 'text-surface-400 hover:bg-white/[0.02]'} `}
                >
                  <HiOutlineCog className="w-6 h-6" />
                  <span className="text-lg">Settings</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-full z-40 bg-surface-950/80 backdrop-blur-3xl border-r border-white/[0.05] flex flex-col shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-5 h-[88px] border-b border-white/[0.05] shrink-0">
        {!sidebarCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center shadow-glow-brand/30">
              <span className="text-white font-display font-bold text-sm tracking-widest">JP</span>
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-white tracking-tight">JAY OS</h1>
              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest">Workspace</p>
            </div>
          </motion.div>
        )}
        <button onClick={toggleSidebar} className={`p-2.5 rounded-xl hover:bg-white/[0.05] text-surface-400 hover:text-white transition-all ${sidebarCollapsed ? 'mx-auto' : ''}`}>
          <HiOutlineMenuAlt2 className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
        <p className={`text-[10px] font-bold text-surface-600 uppercase tracking-widest mb-4 px-3 ${sidebarCollapsed ? 'text-center opacity-0' : ''}`}>Menu</p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={() => handleNavClick(id)} className={`w-full relative flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 group ${isActive ? 'text-brand-300' : 'text-surface-400 hover:text-surface-100 hover:bg-white/[0.02]'} ${sidebarCollapsed ? 'justify-center px-0' : ''}`} title={sidebarCollapsed ? label : ''}>
              {isActive && <motion.div layoutId="activeTab" className="absolute inset-0 bg-brand-500/10 border border-brand-500/20 rounded-2xl shadow-glow-brand/10" initial={false} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <Icon className={`w-[22px] h-[22px] shrink-0 z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'group-hover:scale-110'}`} />
              {!sidebarCollapsed && <span className="z-10 text-sm tracking-wide whitespace-nowrap">{label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.05] shrink-0">
        <button onClick={() => handleNavClick('settings')} className={`w-full relative flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 group ${activeTab === 'settings' ? 'text-white bg-white/[0.05]' : 'text-surface-400 hover:text-surface-100 hover:bg-white/[0.02]'} ${sidebarCollapsed ? 'justify-center px-0' : ''}`} title={sidebarCollapsed ? 'Settings' : ''}>
          <HiOutlineCog className={`w-[22px] h-[22px] shrink-0 transition-transform duration-500 group-hover:rotate-90`} />
          {!sidebarCollapsed && <span className="text-sm tracking-wide">Settings</span>}
        </button>
      </div>
    </motion.aside>
  );
}
