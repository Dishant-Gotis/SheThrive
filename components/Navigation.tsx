
import React, { useState } from 'react';
import { LayoutDashboard, CalendarHeart, PenTool, Sparkles, User, LogOut, Book, Target, Bell, MoreHorizontal, X, Stethoscope, BookOpen, Link, CreditCard, Flower, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tracker', label: 'Cycle', icon: CalendarHeart },
    { id: 'log', label: 'Log', icon: PenTool },
    { id: 'telehealth', label: 'Care', icon: Stethoscope },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reminders', label: 'Meds', icon: Bell },
    { id: 'journal', label: 'Journal', icon: Book },
    { id: 'integrations', label: 'Connect', icon: Link },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'insights', label: 'AI', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Primary items to show on mobile bottom bar
  const mobilePrimaryIds = ['dashboard', 'tracker', 'log', 'telehealth'];
  const mobilePrimaryItems = navItems.filter(item => mobilePrimaryIds.includes(item.id));

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full font-['Nunito']">
       {/* Logo Section */}
       <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border-2 border-pink-100 rotate-3 text-rose-500">
            <Flower size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">SheThrive</h1>
          
          {/* Close button for mobile only */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden ml-auto text-slate-400 hover:text-slate-600 p-2"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* User Mini Profile */}
        {user && (
          <div className="flex items-center gap-3 mb-8 mx-2 bg-white/60 backdrop-blur-sm p-3 rounded-3xl border border-white shadow-sm">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-extrabold border-2 border-white shadow-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs font-bold text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-full transition-all group ${
                activeTab === item.id 
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-200' 
                  : 'text-slate-500 hover:bg-white hover:text-rose-500 font-bold hover:shadow-sm'
              }`}
            >
              <item.icon 
                size={22} 
                strokeWidth={2.5} 
                className={`transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-rose-500'}`} 
              />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-4 pt-6 border-t border-pink-100/50">
           <button 
             onClick={logout}
             className="w-full flex items-center gap-4 px-5 py-3 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 font-bold"
           >
              <LogOut size={22} strokeWidth={2.5} />
              <span>Sign Out</span>
           </button>

          <div className="bg-gradient-to-br from-white to-pink-50 p-4 rounded-3xl border border-pink-100 shadow-sm mx-2">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <Heart size={16} fill="currentColor" />
              <span className="text-xs font-black uppercase tracking-wider">Privacy First</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Your health data is encrypted & safe with us.
            </p>
          </div>
        </div>
    </div>
  );

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-pink-100 px-4 py-3 md:hidden z-40 flex justify-between items-center safe-area-pb shadow-[0_-4px_20px_-5px_rgba(255,192,203,0.3)] rounded-t-[2rem]">
          {mobilePrimaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 w-14 rounded-2xl transition-all ${
                activeTab === item.id ? 'text-rose-500 -translate-y-2' : 'text-slate-300'
              }`}
            >
              <div className={`p-2 rounded-full ${activeTab === item.id ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : ''}`}>
                 <item.icon size={24} strokeWidth={2.5} />
              </div>
            </button>
          ))}
          
          {/* More Button */}
          <button
              onClick={() => setIsMobileMenuOpen(true)}
               className={`flex flex-col items-center gap-1 w-14 rounded-2xl transition-all ${
                isMobileMenuOpen ? 'text-rose-500 -translate-y-2' : 'text-slate-300'
              }`}
            >
               <div className={`p-2 rounded-full ${isMobileMenuOpen ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : ''}`}>
                 <MoreHorizontal size={24} strokeWidth={2.5} />
              </div>
            </button>
      </nav>

      {/* Desktop Sidebar (Static) */}
      <nav className="hidden md:flex flex-col w-72 h-[95vh] my-auto ml-4 bg-white/80 backdrop-blur-xl border border-white shadow-[0_0_40px_-10px_rgba(255,182,193,0.3)] rounded-[2.5rem] fixed left-0 top-0 bottom-0 p-6 z-50 overflow-hidden">
         <SidebarContent />
      </nav>

      {/* Mobile Sidebar (Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fade-in" 
             onClick={() => setIsMobileMenuOpen(false)}
           ></div>
           
           {/* Drawer */}
           <div className="absolute top-0 left-0 h-full w-[85%] max-w-xs bg-[#FFF0F5] shadow-2xl p-6 animate-slide-in-left rounded-r-[2.5rem]">
              <SidebarContent />
           </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
