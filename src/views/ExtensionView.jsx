import React from "react";

export default function ExtensionView() {

  const handleInstall = () => {
    window.open("/truthlens-extension.zip", "_blank");
  };

  return (
    <div className="p-10 text-white relative">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-cyan-500/20 blur-[120px] rounded-full"></div>

      {/* HEADER */}
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Chrome Extension
      </h1>

      <p className="text-gray-400 mb-10 text-lg">
        Detect fake news & deepfakes directly on any website in real-time.
      </p>

      {/* CTA */}
      <button
        onClick={handleInstall}
        className="mb-16 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300"
      >
        🚀 Install Chrome Extension
      </button>

      {/* FEATURES */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">

        <FeatureCard
          title="📰 Highlight & Analyze"
          desc="Select any text → instantly verify fake or real with AI."
        />

        <FeatureCard
          title="🎥 Deepfake Detection"
          desc="Capture images/videos → detect manipulation in seconds."
        />

      </div>

      {/* HOW IT WORKS */}
      <Section title="⚡ How It Works">
        <Step text="Highlight text → Click Analyze" />
        <Step text="Select image/video → Auto scan" />
        <Step text="AI processes data in real-time" />
        <Step text="Get trust score + explanation" />
      </Section>

      {/* INSTALL STEPS */}
      <Section title="🛠 Setup Guide">
        <Step text="Download extension" />
        <Step text="Extract ZIP file" />
        <Step text="Open chrome://extensions" />
        <Step text="Enable Developer Mode" />
        <Step text="Click Load Unpacked" />
        <Step text="Select extension folder" />
      </Section>

    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-[#0a0a0e]/70 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:border-cyan-400 transition-all duration-300 hover:-translate-y-2 shadow-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-12 bg-[#0a0a0e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Step({ text }) {
  return (
    <div className="flex items-center gap-3 text-gray-300">
      <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
      <span>{text}</span>
    </div>
  );
}