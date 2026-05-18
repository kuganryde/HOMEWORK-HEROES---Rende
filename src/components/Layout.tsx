import React, { useState } from 'react';
import { User, UserRole } from '@/types';
import { SCHOOL_INFO } from '@/constants';
import { LayoutDashboard, BookOpen, MessageSquare, Sparkles, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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
      <aside className={`hidden md:flex flex-col ${themeClass} text-white p-6 sticky top-0 h-screen transition-all duration-500 z-50 ${isCollapsed ? 'w-24 items-center px-4' : 'w-64'}`}>
        <div className={`flex items-center gap-3 mb-10 relative ${isCollapsed ? 'justify-center' : ''}`}>
          <img 
            src={SCHOOL_INFO.logoUrl} 
            alt="Logo" 
            className="w-14 h-14 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] object-contain relative z-10" 
          />
          {!isCollapsed && <h1 className="font-bold text-lg leading-tight relative z-10">Homework<br/>Hero</h1>}
          {appTheme === 'default' ? (
            <div className={`absolute ${isCollapsed ? '-top-2 -right-2 scale-75' : '-top-4 -right-4'} rotate-12 drop-shadow-xl z-10 transition-all`}>
              <CapedBook size={48} />
            </div>
          ) : (
            <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
              <Theme3DObject theme={appTheme} />
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-3 relative z-10 w-full">
          {navItems.map((item) => (
            <div key={item.id} className="relative group w-full">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-5'} py-3.5 rounded-2xl transition-all border-2 border-transparent ${
                  activeTab === item.id 
                    ? `bg-white ${festivalTheme ? 'text-slate-900' : 'text-slate-900'} font-black shadow-xl scale-[1.02]` 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={22} className={isCollapsed ? 'shrink-0' : ''} />
                {!isCollapsed && <span className="text-sm tracking-tight truncate">{item.label}</span>}
              </button>
              {/* Tooltip */}
              <div className={`absolute left-full ml-5 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap z-[100] border border-white/10 pointer-events-none animate-in fade-in zoom-in-95 duration-100 ${isCollapsed ? 'ml-3' : 'ml-5'}`}>
                {isCollapsed ? item.label : item.hint}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-white/10" />
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/20 relative z-10 w-full">
          <div className="mb-4 flex flex-col items-center">
            {!isCollapsed && <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1 w-full text-left">App Theme</label>}
            {isCollapsed ? (
              <div className="group relative">
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all">
                   <Sparkles size={18} />
                 </div>
                 <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap z-[100] border border-white/10">
                   <div className="space-y-1">
                      <p className="font-black text-white/50 text-[9px] uppercase tracking-widest mb-2">Change Theme</p>
                      {[
                        {v: 'default', l: 'Default'},
                        {v: 'science', l: 'Science'},
                        {v: 'math', l: 'Math'},
                        {v: 'history', l: 'History'},
                        {v: 'english', l: 'English'},
                        {v: 'sports', l: 'Sports'},
                      ].map(t => (
                        <div key={t.v} onClick={() => setAppTheme?.(t.v)} className="cursor-pointer hover:text-bmc-yellow transition-colors font-bold">{t.l}</div>
                      ))}
                   </div>
                   <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-white/10" />
                 </div>
              </div>
            ) : (
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
            )}
          </div>
          <div className="mb-4">
            {!isCollapsed ? (
              <>
                <p className="text-xs text-white/70">Logged in as</p>
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full inline-block mt-1">
                  {user.role}
                </p>
              </>
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg cursor-help group relative">
                 {user.name.charAt(0)}
                 <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap z-[100] border border-white/10">
                   {user.name} ({user.role})
                   <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-white/10" />
                 </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onLogout}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-white/90 ${isCollapsed ? 'px-2' : ''}`}
              title="Sign Out"
            >
              <LogOut size={20} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/90 flex items-center justify-center"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
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