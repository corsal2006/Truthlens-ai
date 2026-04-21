import React from "react";

export default function BotView() {

  const handleConnect = () => {
    window.open("https://wa.me/919870183525?text=Hello%20LUNA", "_blank");
  };

  return (
    <div className="p-10 text-white relative">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 right-1/3 w-72 h-72 bg-green-500/20 blur-[120px] rounded-full"></div>

      {/* HEADER */}
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
        WhatsApp AI Bot
      </h1>

      <p className="text-gray-400 mb-10 text-lg">
        Verify news, images, and videos instantly from WhatsApp.
      </p>

      {/* CTA */}
      <button
        onClick={handleConnect}
        className="mb-16 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:scale-105 transition-all duration-300"
      >
        🤖 Connect WhatsApp Bot
      </button>

      {/* FEATURES */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">

        <FeatureCard
          title="📰 Verify News"
          desc="Send text or links → get instant fact-check results."
        />

        <FeatureCard
          title="🎥 Detect Deepfakes"
          desc="Send images/videos → AI detects fake media."
        />

      </div>

      {/* HOW IT WORKS */}
      <Section title="⚡ How It Works">
        <Step text="Click Connect WhatsApp Bot" />
        <Step text="Send: Hello LUNA" />
        <Step text="Send text / link / image / video" />
        <Step text="AI analyzes content" />
        <Step text="Get trust score + explanation" />
      </Section>

    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-[#0a0a0e]/70 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:border-green-400 transition-all duration-300 hover:-translate-y-2 shadow-lg">
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
      <div className="w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
      <span>{text}</span>
    </div>
  );
}