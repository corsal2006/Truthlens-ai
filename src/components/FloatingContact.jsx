import React, { useState } from "react";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("feedback");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    console.log({
      type,
      message,
    });

    alert("Message sent 🚀");
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(true)}
          className="group relative px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-110 transition-all duration-300"
        >
          <span className="relative z-10">💬 Contact</span>

          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl blur-xl opacity-60 bg-cyan-500 group-hover:opacity-80 transition"></div>
        </button>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          
          <div className="w-[90%] max-w-md bg-[#0a0a0e]/90 border border-white/10 rounded-3xl p-6 shadow-2xl relative">

            {/* CLOSE */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              Contact / Feedback
            </h2>

            {/* TYPE SELECT */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
            >
              <option value="feedback">Feedback</option>
              <option value="suggestion">Suggestion</option>
              <option value="business">Business Inquiry</option>
              <option value="bug">Report Bug</option>
            </select>

            {/* MESSAGE */}
            <textarea
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-28 p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none mb-4 resize-none"
            />

            {/* SUBMIT */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold hover:scale-105 transition"
            >
              Send Message
            </button>
          </div>
        </div>
      )}
    </>
  );
}