import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';

import HomeView from './views/HomeView';
import DeepfakeView from './views/DeepfakeView';
import NewsView from './views/NewsView';
import DashboardView from './views/DashboardView';

import BotView from './views/BotView';
import ExtensionView from './views/ExtensionView';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setIsGuest(false); 
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-gray-100 font-sans overflow-hidden">
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLoginClick={() => setIsLoginOpen(true)} 
        user={user}
        isGuest={isGuest}
        setIsGuest={setIsGuest}
      />

      <div className="flex-1 flex flex-col relative w-full h-full">
        
        {activeTab === 'home' && !user && !isGuest && (
          <div className="absolute top-0 right-0 w-full h-20 flex items-center justify-end px-8 z-20 pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-6 py-2.5 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 rounded-xl transition-all duration-300 shadow-lg"
              >
                Log in
              </button>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-105"
              >
                Sign up for free
              </button>
            </div>
          </div>
        )}

        {/* ✅ PASS setActiveTab */}
        <div className="flex-1 overflow-y-auto w-full h-full z-10 relative">
          
          {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
          {activeTab === 'deepfake' && <DeepfakeView />}
          {activeTab === 'news' && <NewsView />}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'whatsapp' && <BotView />}
          {activeTab === 'extension' && <ExtensionView />}

        </div>
      </div>

      {isLoginOpen && (
        <LoginModal 
          onClose={() => setIsLoginOpen(false)} 
          onGuestLogin={() => {
            setIsGuest(true);
            setIsLoginOpen(false);
          }} 
        />
      )}
    </div>
  );
}