import { useAppStore } from '../store/appStore';
import { HiOutlineCheckCircle, HiOutlineClipboardList, HiOutlineChartBar, HiOutlineSparkles, HiOutlineCog, HiOutlineMenu } from 'react-icons/hi';

const navItems = [
  { id: 'habits', label: 'Habits', icon: HiOutlineCheckCircle },
  { id: 'tasks', label: 'Tasks', icon: HiOutlineClipboardList },
  { id: 'analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { id: 'ai', label: 'AI Command', icon: HiOutlineSparkles },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
        bg-surface-950/80 backdrop-blur-2xl border-r border-white/[0.06]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-[72px]">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-white font-bold text-sm">JP</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">JAY Productivity</h1>
              <p className="text-[10px] text-surface-500 font-medium uppercase tracking-widest">Dashboard</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/[0.06] text-surface-400 hover:text-white transition-colors"
        >
          <HiOutlineMenu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 mt-4 space-y-1">
        <p className={`text-[10px] font-semibold text-surface-600 uppercase tracking-widest mb-3 ${sidebarCollapsed ? 'text-center' : 'px-3'}`}>
          {sidebarCollapsed ? '•' : 'Navigation'}
        </p>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            onClick={() => setActiveTab(id)}
            className={`w-full ${activeTab === id ? 'nav-item-active' : 'nav-item'} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Settings footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.04]">
        <button
          id="nav-settings"
          onClick={() => setActiveTab('settings')}
          className={`w-full ${activeTab === 'settings' ? 'nav-item-active' : 'nav-item'} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
        >
          <HiOutlineCog className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm">Settings</span>}
        </button>
      </div>
    </aside>
  );
}
