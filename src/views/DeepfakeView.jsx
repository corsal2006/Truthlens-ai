import React, { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Send, RefreshCw, ShieldAlert, ScanSearch, Fingerprint, 
  Image as ImageIcon, Video, FileText, X, Zap, Play, Eye
} from "lucide-react";

export default function DeepfakeView() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
    setShowMenu(false);
  };

  const handleDetect = async () => {
  if (!file) return;
  setLoading(true);

  const formData = new FormData();

  // ✅ HISTORY FIX (ONLY ADDITION)
  formData.append("userId", "demo-user");

  formData.append("file", file);

  try {
    const res = await axios.post("http://localhost:5000/deepfake", formData);
    setResult(res.data);
  } catch (err) {
    console.error("Detection Failed:", err);
  } finally {
    setLoading(false);
  }
};

  const resetUI = () => {
    setResult(null);
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-10 overflow-hidden relative font-sans">
      
      {/* 1. TOP HEADER (Left Aligned) */}
      <div className="w-full max-w-7xl mx-auto flex justify-between items-start z-10 mb-6">
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
            Detect Deepfake
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-1 italic">
            TruthLens Vision: Biometric & artifact analysis for synthetic media detection.
          </p>
        </motion.div>

        {result && (
          <button 
            onClick={resetUI} 
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-[10px] font-black transition-all shadow-lg shadow-indigo-500/20"
          >
            <RefreshCw size={14} /> NEW DETECTION
          </button>
        )}
      </div>

      {/* 2. CENTER CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-4 z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl flex flex-col items-center"
            >
              {/* Preview Box or Explainer Cards */}
              {!preview ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                  <FeatureCard icon={<ScanSearch size={24} className="text-indigo-500" />} title="Frame Analysis" desc="Extracts and scrutinizes individual frames for visual inconsistencies." />
                  <FeatureCard icon={<Fingerprint size={24} className="text-blue-500" />} title="Neural Mapping" desc="Uses SightEngine models to detect AI-generated skin textures and lighting." />
                  <FeatureCard icon={<ShieldAlert size={24} className="text-emerald-500" />} title="Integrity Check" desc="Provides a definitive probability score for videos and static images." />
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-md w-full aspect-video bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl mb-8">
                  {file.type.startsWith("video") ? (
                    <video src={preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" muted />
                  ) : (
                    <img src={preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="preview" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-4 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                      <Eye size={32} className="text-indigo-400" />
                    </div>
                  </div>
                  <button onClick={() => {setFile(null); setPreview(null);}} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-red-500/80 transition-all">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* RESULTS DASHBOARD */
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl space-y-6 pb-32"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* PROBABILITY METER */}
                <div className="md:col-span-5 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-2xl">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#151515" strokeWidth="8" />
                      <motion.circle 
                        cx="50" cy="50" r="44" fill="none" 
                        stroke={result.score < 0.4 ? "#10b981" : result.score < 0.7 ? "#f59e0b" : "#ef4444"} 
                        strokeWidth="8" strokeLinecap="round" strokeDasharray="276"
                        initial={{ strokeDashoffset: 276 }}
                        animate={{ strokeDashoffset: 276 - (276 * result.score) }} 
                        transition={{ duration: 1.5 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-black">
                      <span className="text-3xl italic">{Math.round(result.score * 100)}%</span>
                      <span className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">AI Match</span>
                    </div>
                  </div>
                  <h2 className={`mt-8 text-2xl font-black uppercase italic tracking-tighter ${result.score > 0.6 ? "text-red-500" : "text-green-500"}`}>
                    {result.verdict}
                  </h2>
                </div>

                {/* DIAGNOSTIC PANEL */}
                <div className="md:col-span-7 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-4 text-indigo-500 font-black uppercase text-[10px] tracking-[0.3em]">
                     <Zap size={14} /> Diagnostic Findings
                   </div>
                   <p className="text-gray-300 text-base leading-relaxed italic opacity-90 border-l-2 border-indigo-500/30 pl-4">
                     {result.explanation}
                   </p>
                   <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                      <div className="flex-1 bg-white/[0.03] p-3 rounded-xl">
                        <div className="text-[8px] text-gray-500 font-bold uppercase mb-1">Source Model</div>
                        <div className="text-xs font-bold text-indigo-400 tracking-widest">SIGHTENGINE-G1</div>
                      </div>
                      <div className="flex-1 bg-white/[0.03] p-3 rounded-xl">
                        <div className="text-[8px] text-gray-500 font-bold uppercase mb-1">Status</div>
                        <div className="text-xs font-bold text-gray-300 uppercase">Analysis Complete</div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. BOTTOM CENTER INPUT BAR */}
      <div className="fixed bottom-10 left-24 -right-24 flex justify-center px-6 z-50 pointer-events-none">
        <div className="w-full max-w-xl bg-[#0f0f0f] border border-white/10 rounded-full p-2 flex items-center shadow-[0_20px_50px_rgba(0,0,0,1)] pointer-events-auto relative">
          
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-3 text-gray-500 hover:text-white transition-all"
          >
            <Plus size={22} className={showMenu ? "rotate-45" : ""} />
          </button>
          
          <div className="flex-1 flex flex-col px-4">
            <span className="text-xs text-gray-500 font-medium px-1">
              {file ? file.name.slice(0, 30) + "..." : "Select media for neural inspection..."}
            </span>
          </div>

          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="video/*,image/*" />

          <button 
            onClick={handleDetect} 
            disabled={loading || !file}
            className="bg-white text-black p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl disabled:opacity-10"
          >
            {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Send size={18} />}
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 mb-4 bg-[#141414] border border-white/10 rounded-2xl p-2 w-44 shadow-2xl">
                <MenuAction icon={<ImageIcon size={14}/>} label="Select Image" onClick={() => fileInputRef.current.click()} />
                <MenuAction icon={<Video size={14}/>} label="Select Video" onClick={() => fileInputRef.current.click()} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div whileHover={{ y: -8 }} className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl group transition-all text-center">
      <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="font-black text-xl mb-3 uppercase italic tracking-tighter">{title}</h3>
      <p className="text-gray-500 text-[10px] leading-relaxed font-medium px-4">{desc}</p>
      <div className="mt-8 h-1 w-10 bg-indigo-600 mx-auto rounded-full group-hover:w-full transition-all duration-700" />
    </motion.div>
  );
}

function MenuAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-tighter">
      {icon} {label}
    </button>
  );
}