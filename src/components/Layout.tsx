import React from 'react';
import { User, UserRole } from '@/types';
import { SCHOOL_INFO } from '@/constants';
import { LayoutDashboard, BookOpen, MessageSquare, Sparkles, Settings, LogOut } from 'lucide-react';
import { CapedBook } from '@/components/HeroMascot';
import { Theme3DObject } from '@/components/Theme3DObject';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  festivalTheme?: string;
  appTheme?: string;
  setAppTheme?: (theme: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeTab, setActiveTab, children, festivalTheme, appTheme = 'default', setAppTheme }) => {
  const isTeacher = user.role === UserRole.TEACHER;
  
  // Determine base theme class based on appTheme
  let baseThemeClass = 'bmc-red';
  if (appTheme === 'science') baseThemeClass = 'bg-blue-600';
  if (appTheme === 'math') baseThemeClass = 'bg-purple-600';
  if (appTheme === 'history') baseThemeClass = 'bg-amber-700';
  if (appTheme === 'english') baseThemeClass = 'bg-indigo-600';
  if (appTheme === 'sports') baseThemeClass = 'bg-orange-600';

  const themeClass = festivalTheme || baseThemeClass;
  const textAccentClass = festivalTheme ? 'text-white' : 'text-bmc-red';
  const bgAccentClass = festivalTheme ? 'bg-white/10' : 'bg-red-50';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: "Main overview & tasks" },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles, hint: "Chat with Gemini AI" },
    { id: 'messages', label: 'Messages', icon: MessageSquare, hint: "Direct school-home chat" },
    { id: 'settings', label: 'Settings', icon: Settings, hint: isTeacher ? "Manage your profile" : "Manage student profiles" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen mesh-bg">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-64 ${themeClass} text-white p-6 sticky top-0 h-screen transition-colors duration-1000 z-50`}>
        <div className="flex items-center gap-3 mb-10 relative">
          <img 
            src={SCHOOL_INFO.logoUrl} 
            alt="Logo" 
            className="w-14 h-14 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] object-contain relative z-10" 
          />
          <h1 className="font-bold text-lg leading-tight relative z-10">Homework<br/>Hero</h1>
          {appTheme === 'default' ? (
            <div className="absolute -top-4 -right-4 rotate-12 drop-shadow-xl z-10">
              <CapedBook size={48} />
            </div>
          ) : (
            <Theme3DObject theme={appTheme} />
          )}
        </div>

        <nav className="flex-1 space-y-3 relative z-10">
          {navItems.map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all border-2 border-transparent ${
                  activeTab === item.id 
                    ? `bg-white ${festivalTheme ? 'text-slate-900' : 'text-slate-900'} font-black shadow-xl scale-[1.02]` 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={22} />
                <span className="text-sm tracking-tight">{item.label}</span>
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-5 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap z-[100] border border-white/10 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                {item.hint}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-white/10" />
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/20 relative z-10">
          <div className="mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1 block">App Theme</label>
            <select 
              value={appTheme}
              onChange={(e) => setAppTheme && setAppTheme(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
            >
              <option value="default" className="text-slate-900">Default (Hero)</option>
              <option value="science" className="text-slate-900">The Laboratory (Science)</option>
              <option value="math" className="text-slate-900">The Equation Pro (Math)</option>
              <option value="history" className="text-slate-900">The Legacy (History)</option>
              <option value="english" className="text-slate-900">The Lexicon (English)</option>
              <option value="sports" className="text-slate-900">The MVP (Sports)</option>
            </select>
          </div>
          <div className="mb-4">
            <p className="text-xs text-white/70">Logged in as</p>
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full inline-block mt-1">
              {user.role}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-white/90"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className={`md:hidden flex items-center justify-between p-4 ${themeClass} text-white sticky top-0 z-50 shadow-md transition-colors duration-1000`}>
        <div className="flex items-center gap-2">
          <img 
            src={SCHOOL_INFO.logoUrl} 
            alt="Logo" 
            className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] object-contain" 
          />
          <span className="font-bold">Homework Hero</span>
        </div>
        <button onClick={onLogout} className="p-2"><LogOut size={20} /></button>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        
        {/* Global Banner */}
        <div className="w-full mb-6 md:mb-8 rounded-2xl md:rounded-[32px] overflow-hidden flex items-center justify-center max-w-[800px] mx-auto">
          <img src="https://i.ibb.co/9Hx5SWTG/Web-Banner.png" alt="Announcement Banner" className="w-full h-auto object-contain" />
        </div>

        <header className="mb-8 hidden md:block">
            <h2 className="text-2xl font-bold text-slate-800">
                {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-slate-500">Welcome back, {user.name}!</p>
        </header>
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-2 z-50 pb-safe shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2.5 rounded-2xl min-w-[64px] transition-all active:scale-90 ${
              activeTab === item.id ? `${festivalTheme ? 'text-slate-900 bg-slate-100' : 'text-bmc-red bg-red-50'} font-black` : 'text-slate-500 font-medium'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'stroke-[3px]' : 'stroke-[2px]'} />
            <span className="text-[10px] mt-1.5 tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;