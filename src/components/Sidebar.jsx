import React from 'react';
import { Home, ShieldAlert, FileText, LayoutDashboard, Puzzle, LogOut, User as UserIcon, Bot } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Sidebar({ activeTab, setActiveTab, onLoginClick, user, isGuest, setIsGuest }) {

  const mainNav = [
    { id: 'home', icon: <Home size={18} />, text: 'Home' },
    { id: 'deepfake', icon: <ShieldAlert size={18} />, text: 'Detect Deepfake' },
    { id: 'news', icon: <FileText size={18} />, text: 'Verify News' },
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, text: 'Dashboard' },
  ];

  const advancedNav = [
    { id: 'whatsapp', icon: <Bot size={18} />, text: 'WhatsApp Bot' },
    { id: 'extension', icon: <Puzzle size={18} />, text: 'Chrome Extension' },
  ];

  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
    } else {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out: ", error);
      }
    }
  };

  return (
    <div className="w-[260px] bg-[#050505] flex flex-col h-full border-r border-white/5 relative z-30">
      
      {/* TOP */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
        
        {/* LOGO */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center px-2 mb-6 cursor-pointer group"
        >
          <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 group-hover:scale-[1.03] transition">
            TruthLens AI
          </span>
        </div>

        {/* MAIN NAV */}
        {mainNav.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left group relative overflow-hidden
              ${activeTab === item.id 
                ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                : 'border border-transparent text-gray-400 hover:bg-white/[0.03] hover:text-white'}`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]"></div>
            )}

            <div className={`transition-all duration-300 
              ${activeTab === item.id 
                ? 'text-cyan-400 scale-110' 
                : 'text-gray-500 group-hover:text-cyan-400 group-hover:scale-110'}`}
            >
              {item.icon}
            </div>

            <span className="text-sm tracking-wide">{item.text}</span>
          </button>
        ))}

        {/* ADVANCED */}
        <div className="mt-6 px-2">
          <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">
            Advanced
          </p>

          {advancedNav.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left group relative overflow-hidden
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/5 border border-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                  : 'border border-transparent text-gray-400 hover:bg-white/[0.03] hover:text-white'}`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)]"></div>
              )}

              <div className={`transition-all duration-300 
                ${activeTab === item.id 
                  ? 'text-purple-400 scale-110' 
                  : 'text-gray-500 group-hover:text-purple-400 group-hover:scale-110'}`}
              >
                {item.icon}
              </div>

              <span className="text-sm tracking-wide">{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="shrink-0 p-4 border-t border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md">
        {user || isGuest ? (
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="profile" className="w-9 h-9 rounded-full border border-white/10" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-white/20 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  <UserIcon size={16} className="text-white" />
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm text-white font-semibold truncate">
                  {user?.displayName || (isGuest ? 'Guest User' : 'TruthLens User')}
                </span>
                <span className="text-[11px] text-cyan-400/80 truncate">
                  {user?.email || 'Guest Mode Active'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-all"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        ) : (
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-4">
            <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <h4 className="text-[15px] font-bold text-white mb-1.5">
              Log in to save responses
            </h4>

            <p className="text-[11px] text-gray-400 mb-4">
              Track history, save reports & unlock features.
            </p>

            <button 
              onClick={onLoginClick}
              className="w-full py-2.5 bg-white hover:bg-gray-200 text-black text-sm font-extrabold rounded-xl transition-all"
            >
              Log in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}