import React from 'react';

export default function Flashcard({ title, desc }) {
  return (
    <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-transparent hover:from-cyan-400/60 hover:via-purple-500/40 transition-all duration-500">
      
      {/* Inner Card */}
      <div className="bg-[#0b0b0f]/90 backdrop-blur-xl rounded-2xl p-5 border border-white/5 group-hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden">

        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-xl"></div>

        {/* Content */}
        <h4 className="text-[15px] font-semibold text-white group-hover:text-cyan-300 transition mb-1.5 relative z-10">
          {title}
        </h4>

        <p className="text-xs text-gray-400 leading-relaxed font-medium relative z-10">
          {desc}
        </p>
      </div>
    </div>
  );
}