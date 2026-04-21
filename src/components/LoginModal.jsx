import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function LoginModal({ onClose, onGuestLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all p-4">
      {/* Reduced max-width and padding */}
      <div className="bg-[#0a0a0c] w-full max-w-[380px] rounded-3xl p-6 border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative animate-in fade-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full">
          <X size={16} />
        </button>
        
        <div className="text-center mb-6 mt-2">
          <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 block mb-1">
            TruthLens AI
          </span>
          <h2 className="text-sm font-medium text-gray-400">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
        </div>

        {error && <p className="text-red-400 text-xs text-center mb-4 bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</p>}

        <form onSubmit={handleAuth} className="space-y-3">
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            {isSignUp ? 'Sign Up' : 'Continue'}
          </button>
        </form>
          
        <div className="flex items-center gap-3 my-4 opacity-40">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-[10px] text-white uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full mb-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button 
          onClick={() => { onGuestLogin(); onClose(); }} 
          className="w-full py-2.5 bg-transparent border border-dashed border-white/20 hover:border-cyan-500/50 text-gray-400 hover:text-white text-sm font-medium rounded-xl transition-all"
        >
          Continue as Guest
        </button>

        <p className="text-xs text-gray-500 text-center mt-5">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors hover:underline">
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}