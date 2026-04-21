import { motion } from "framer-motion";

export default function ResultModal({ data, onClose }) {
  if (!data) return null;

  const analysis = data.result?.analysis || {};

  return (
    <div className="fixed inset-0 left-24 -right-24 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f172a] p-6 rounded-2xl w-full max-w-2xl border border-white/10"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Analysis Result</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* INPUT */}
        <p className="text-gray-300 mb-4">{data.input}</p>

        {/* SCORE */}
        <h1 className="text-4xl font-bold text-indigo-400 mb-4">
          {Math.round((analysis.truth_score || 0) * 100)}%
        </h1>

        {/* VERDICT */}
        <p className="mb-5 text-lg">
          Verdict: <strong>{analysis.verdict}</strong>
        </p>

        {/* EXPLAINABLE AI */}
        <div>
          <p className="text-sm text-gray-400 mb-3">
            🧠 Explainable AI
          </p>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {analysis.claim_analysis?.map((item, i) => (
              <div
                key={i}
                className="bg-white/5 p-3 rounded-xl border border-white/10"
              >
                <p className="text-xs text-gray-400">Claim</p>
                <p className="text-white text-sm">{item.claim}</p>

                <p className="text-xs text-gray-400 mt-2">Reason</p>
                <p className="text-gray-300 text-sm">{item.reason}</p>

                <span className="text-xs mt-2 inline-block px-2 py-1 rounded bg-indigo-500/20 text-indigo-400">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}