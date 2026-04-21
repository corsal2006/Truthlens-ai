import React, { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Send, RefreshCw, ShieldCheck, Globe, Activity, 
  Image as ImageIcon, Link as LinkIcon, Mic, Video, FileText, X, Zap, Layers, Search, Cpu
} from "lucide-react";

export default function NewsView() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);

  // ... (Your imports remain same)
  const handleAnalyze = async () => {
  if (!input && !file) return;
  setLoading(true);
  setShowMenu(false);
  
  const formData = new FormData();

  // ✅ FIX FOR HISTORY (ONLY ADDITION)
  formData.append("userId", "demo-user");

  if (file) {
    formData.append("file", file);
    formData.append("type", file.type.startsWith("image") ? "image" : "media");
  }

  if (input.startsWith("http")) formData.append("link", input);
  else formData.append("text", input);

  try {
    const res = await axios.post("https://truthlens-backendd.onrender.com/verify", formData);
    setResult(res.data);

    // Optional: Clear inputs after success
    setInput("");
    setFile(null);

  } catch (err) {
    console.error("Critical Analysis Error:", err);
  } finally {
    setLoading(false);
  }
};
// ... (Rest of your UI code remains same)

  // NORMALIZE SCORE: Ensures 0.8 becomes 80% and 80 stays 80.
  const getScore = (score) => {
    if (!score) return 0;
    return score <= 1 ? Math.round(score * 100) : Math.round(score);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-10 overflow-hidden relative font-sans">
      
      {/* HEADER SECTION (TOP LEFT) */}
      <div className="w-full max-w-7xl mx-auto flex justify-between items-start z-10 mb-6">
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
            Verify News
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-1 italic">
            TruthLens AI: Advanced neural verification & global stream validation.
          </p>
        </motion.div>

        {result && (
          <button 
            onClick={() => {setResult(null); setInput(""); setFile(null);}} 
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-[10px] font-black transition-all shadow-lg shadow-indigo-500/20"
          >
            <RefreshCw size={14} /> NEW SCAN
          </button>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-4 z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            /* STARTUP STYLE EXPLAINER CARDS */
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
            >
              <FeatureCard icon={<Cpu size={24} className="text-indigo-500" />} title="How to Verify" desc="Input any link or media. Llama-3 extracts core factual claims for deep cross-examination." />
              <FeatureCard icon={<Layers size={24} className="text-blue-500" />} title="How it Works" desc="Serper API crawls live global news nodes. We check for corroboration and contradictory evidence." />
              <FeatureCard icon={<Zap size={24} className="text-emerald-500" />} title="The Verdict" desc="Our neural engine generates an explainable reliability score with cited sources for transparency." />
            </motion.div>
          ) : (
            /* FIXED RESULTS UI */
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl space-y-6 pb-40 overflow-y-auto max-h-[78vh] no-scrollbar px-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* RELIABILITY METER (FIXED COLOR LOGIC) */}
                <div className="md:col-span-4 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-2xl relative">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#151515" strokeWidth="8" />
                      <motion.circle 
                        cx="50" cy="50" r="44" fill="none" 
                        stroke={getScore(result.analysis.truth_score) >= 50 ? "#10b981" : "#ef4444"} 
                        strokeWidth="8" strokeLinecap="round" strokeDasharray="276"
                        initial={{ strokeDashoffset: 276 }}
                        animate={{ strokeDashoffset: 276 - (276 * getScore(result.analysis.truth_score)) / 100 }}
                        transition={{ duration: 1.5 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-black text-2xl italic">
                      {getScore(result.analysis.truth_score)}%
                    </div>
                  </div>
                  <h2 className={`mt-8 text-2xl font-black uppercase italic tracking-tighter ${getScore(result.analysis.truth_score) >= 50 ? "text-green-500" : "text-red-500"}`}>
                    {result.analysis.verdict}
                  </h2>
                </div>

                {/* DIAGNOSTIC REASONING */}
                <div className="md:col-span-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                   <div className="flex items-center gap-2 mb-4 text-indigo-500 font-black uppercase text-[10px] tracking-[0.3em]">
                     <ShieldCheck size={14} /> Diagnostic Reasoning Report
                   </div>
                   <p className="text-gray-300 text-sm leading-relaxed mb-8 italic border-l-2 border-indigo-500/30 pl-4 whitespace-pre-wrap">
                     {result.analysis.explanation}
                   </p>
                   
                   <div className="grid grid-cols-1 gap-3">
                     {result.analysis.claim_analysis?.map((c, i) => (
                       <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl flex justify-between items-center">
                         <span className="text-[11px] text-gray-400 font-bold uppercase truncate mr-4">{c.claim}</span>
                         <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-md ${c.status === 'Real' || c.status === 'True' || c.status === 'Verified' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500 underline'}`}>
                           {c.status}
                         </span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              {/* SOURCE GRID (MISSING IN YOUR SCREENSHOT) */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                 <div className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                    <Globe size={16} /> Verified Evidence Streams
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {result.sources?.map((src, i) => (
                     <a key={i} href={src.link} target="_blank" rel="noreferrer" className="flex flex-col gap-2 p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                        <span className="text-xs font-bold text-gray-300 leading-normal line-clamp-2">{src.title}</span>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-[9px] text-indigo-400 font-black uppercase tracking-tighter truncate w-32">{new URL(src.link).hostname}</span>
                        </div>
                     </a>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CHAT INPUT BAR (BOTTOM CENTER) */}
      <div className="fixed bottom-10 left-24 -right-24 flex justify-center px-6 z-50 pointer-events-none">
        <div className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-full p-2 flex items-center shadow-[0_20px_50px_rgba(0,0,0,1)] pointer-events-auto relative">
          
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-3 text-gray-500 hover:text-white transition-all"
            >
              <Plus size={22} className={showMenu ? "rotate-45" : ""} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 mb-4 bg-[#141414] border border-white/10 rounded-2xl p-2 w-48 shadow-2xl z-[100]">
                  <MenuAction icon={<ImageIcon size={14}/>} label="Image Analysis" onClick={() => fileInputRef.current.click()} />
                  <MenuAction icon={<Mic size={14}/>} label="Audio Whisper" onClick={() => fileInputRef.current.click()} />
                  <MenuAction icon={<Video size={14}/>} label="Video Metadata" onClick={() => fileInputRef.current.click()} />
                  <MenuAction icon={<LinkIcon size={14}/>} label="Link Scraper" onClick={() => setShowMenu(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 flex flex-col px-4">
            {file && (
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[9px] w-fit mb-1 text-indigo-400 font-bold border border-indigo-500/20">
                <FileText size={10} /> {file.name.slice(0, 15)}...
                <X size={10} className="cursor-pointer" onClick={() => setFile(null)} />
              </div>
            )}
            <input 
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Paste URL or context for neural scan..." 
              className="bg-transparent border-none focus:ring-0 text-sm py-2 w-full placeholder-gray-700 font-medium"
            />
          </div>

          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {setFile(e.target.files[0]); setShowMenu(false);}} />

          <button onClick={handleAnalyze} disabled={loading} className="bg-white text-black p-3 rounded-full hover:scale-105 transition-all shadow-xl disabled:opacity-10">
            {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div whileHover={{ y: -8 }} className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl group transition-all text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-center mb-6">{icon}</div>
      <h3 className="font-black text-xl mb-3 uppercase italic tracking-tighter">{title}</h3>
      <p className="text-gray-500 text-[11px] leading-relaxed font-medium px-4">{desc}</p>
      <div className="mt-8 h-1 w-10 bg-indigo-600 mx-auto rounded-full group-hover:w-full transition-all duration-700" />
    </motion.div>
  );
}

function MenuAction({ icon, label, onClick }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-tighter">
      {icon} {label}
    </button>
  );
}