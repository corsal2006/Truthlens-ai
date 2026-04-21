import React, { useState, useEffect } from 'react';
import { Fingerprint, Activity, Zap, ShieldCheck } from 'lucide-react';
import Flashcard from "../components/Flashcard";

export default function HomeView({ setActiveTab }) {

  const [type, setType] = useState("Feedback");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const options = ["Feedback", "Suggestion", "Business Inquiry", "Report Bug"];

  const handleSubmit = () => {
    console.log({ type, message });
    alert("Message sent 🚀");
    setMessage("");
  };

  // ✅ UPDATED: NAVIGATION INSTEAD OF DIRECT ACTION
  const handleWhatsAppConnect = () => {
    setActiveTab("whatsapp");
  };

  const handleInstallExtension = () => {
    setActiveTab("extension");
  };

  // (optional detection - future use)
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === "TRUTHLENS_EXTENSION_INSTALLED") {
        console.log("Extension detected ✅");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const advancedFeatures = [
    { title: "🤖 WhatsApp AI Bot", desc: "Forward messages, images or videos and get instant verification with trust score & explanation." },
    { title: "🌐 Chrome Extension", desc: "Detect fake news directly on websites with real-time overlays and warnings." },
    { title: "🧠 Explainable AI Engine", desc: "See why content is fake with source credibility, references & reasoning." },
    { title: "🚨 Misinformation Alerts", desc: "Get alerts when viral misleading content is spreading rapidly." },
    { title: "🧬 Source Graph Tracking", desc: "Visualize how misinformation spreads across platforms and its origin." },
    { title: "🛡️ Identity Protection", desc: "Detect if your face or identity is misused in deepfake content." },
  ];

  return (
    <div className="min-h-full flex flex-col items-center px-6 relative pt-32 pb-20">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-cyan-600/20 rounded-full blur-[100px] animate-pulse-glow"></div>
        <div className="absolute top-[50%] right-[15%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse-glow"></div>
      </div>

      <div className="z-10 flex flex-col items-center max-w-6xl w-full">

        {/* HERO */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-center">
          TruthLens AI
        </h1>

        <p className="text-lg text-gray-400 mb-10 text-center max-w-2xl">
          Real-time misinformation detection across platforms. <br/>
          <span className="text-white font-semibold">Your AI-powered trust layer.</span>
        </p>

        {/* BUTTONS */}
        <div className="flex gap-4 mb-16 flex-wrap justify-center">
          <button 
            onClick={handleWhatsAppConnect}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 text-black font-semibold shadow-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition"
          >
            🤖 Connect WhatsApp Bot
          </button>

          <button 
            onClick={handleInstallExtension}
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white hover:border-cyan-400 transition"
          >
            🌐 Install Chrome Extension
          </button>
        </div>

        {/* CORE FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-20">
          <GlassCard icon={<Fingerprint size={24} />} title="Multi-Modal Detection" desc="Analyze text, images & videos using AI." />
          <GlassCard icon={<Activity size={24} />} title="Explainable AI" desc="Transparent reasoning with sources." />
          <GlassCard icon={<Zap size={24} />} title="Real-Time Verification" desc="Instant results across platforms." />
          <GlassCard icon={<ShieldCheck size={24} />} title="Trust Score" desc="0–100 reliability score." />
        </div>

        {/* ADVANCED FEATURES */}
        <div className="w-full mb-24">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            Advanced Capabilities
          </h2>

          <p className="text-gray-400 text-sm text-center mb-10">
            Powerful tools that make TruthLens AI a real-time trust layer across the internet
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {advancedFeatures.map((item, i) => (
              <Flashcard key={i} title={item.title} desc={item.desc} />
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div className="w-full max-w-2xl relative">

          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl opacity-60"></div>

          <div className="relative bg-[#0a0a0e]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">

            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              💬 Contact & Feedback
            </h2>

            <p className="text-gray-400 text-sm text-center mb-6">
              Suggestions, business inquiries, or report issues — we’d love to hear from you.
            </p>

            <div className="relative mb-4">
              <div
                onClick={() => setOpen(!open)}
                className="w-full p-3 rounded-xl bg-[#121216] border border-white/10 text-white cursor-pointer flex justify-between items-center"
              >
                {type}
                <span>▾</span>
              </div>

              {open && (
                <div className="absolute w-full mt-2 bg-[#121216] border border-white/10 rounded-xl overflow-hidden z-50">
                  {options.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setType(opt);
                        setOpen(false);
                      }}
                      className="p-3 text-white hover:bg-cyan-500/20 cursor-pointer"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-28 p-3 rounded-xl bg-[#121216] border border-white/10 text-white mb-4 resize-none"
            />

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold"
            >
              Send Message 🚀
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

function GlassCard({ title, desc, icon }) {
  return (
    <div className="bg-[#0a0a0e]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 group shadow-xl relative overflow-hidden flex flex-col">
      <div className="bg-white/5 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 text-cyan-400">
        {icon}
      </div>
      <h4 className="font-bold text-lg text-white mb-2">{title}</h4>
      <p className="text-[13px] text-gray-400">{desc}</p>
    </div>
  );
}