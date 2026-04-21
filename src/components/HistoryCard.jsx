import { motion } from "framer-motion";

export default function HistoryCard({ data, onClick, onDelete }) {
  const analysis = data.result?.analysis || {};

  const score = Math.round((analysis.truth_score || 0) * 100);
  const verdict = analysis.verdict || "Unknown";

  const date = data.createdAt
    ? new Date(
        data.createdAt._seconds
          ? data.createdAt._seconds * 1000
          : data.createdAt
      ).toLocaleString()
    : "No date";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="relative bg-[#0f172a] p-5 rounded-2xl cursor-pointer border border-white/10 hover:border-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/20"
    >
      {/* 🔥 DELETE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent modal opening
          onDelete(data.id);   // 🔥 Firestore doc.id
        }}
        className="absolute top-3 right-3 z-20 text-red-400 hover:text-red-600 text-sm bg-black/40 px-2 py-1 rounded-lg backdrop-blur"
      >
        ✕
      </button>

      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <span className="text-xs text-gray-400 uppercase">
          {data.type || "TEXT"}
        </span>

        <span
          className={`text-xs px-3 py-1 rounded-full font-bold ${
            verdict === "Real"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {verdict.toUpperCase()}
        </span>
      </div>

      {/* CONTENT */}
      <h2 className="text-sm text-white font-medium line-clamp-2 mb-4 relative z-10">
        {data.input}
      </h2>

      {/* SCORE */}
      <div className="mb-2 relative z-10">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Truth Score</span>
          <span>{score}%</span>
        </div>

        <div className="w-full h-2 bg-gray-700 rounded-full">
          <div
            className="h-2 rounded-full bg-indigo-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* DATE */}
      <p className="text-xs text-gray-500 mt-2 relative z-10">
        {date}
      </p>
    </motion.div>
  );
}