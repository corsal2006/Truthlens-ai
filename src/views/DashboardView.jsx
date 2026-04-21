import { useEffect, useState } from "react";
import HistoryCard from "../components/HistoryCard";
import ResultModal from "../components/ResultModal";
import Analytics from "../components/Analytics";
import { auth } from "../firebase";

export default function DashboardView() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const userId = auth.currentUser?.uid || "demo-user";

  // 🔥 FETCH HISTORY
  useEffect(() => {
    fetch(`http://localhost:5000/api/history/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log("History Data:", data); // DEBUG
        setHistory(data);
      })
      .catch(err => console.error(err));
  }, []);

  // 🔥 DELETE FUNCTION
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await fetch(`http://localhost:5000/api/history/${id}`, {
        method: "DELETE",
      });

      // 🔥 Update UI instantly
      setHistory(prev => prev.filter(item => item.id !== id));

    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // 🔥 FILTER
  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;

    const date = new Date(
      item.createdAt?._seconds
        ? item.createdAt._seconds * 1000
        : item.createdAt
    );

    const now = new Date();

    if (filter === "today") {
      return date.toDateString() === now.toDateString();
    }

    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }

    if (filter === "month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });

  // 🔥 SORT
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const aDate = a.createdAt?._seconds || 0;
    const bDate = b.createdAt?._seconds || 0;
    return bDate - aDate;
  });

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            📊 TruthLens Dashboard
          </h1>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#111] px-4 py-2 rounded-lg border border-white/10"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* ANALYTICS */}
        <Analytics data={sortedHistory} />

        {/* EMPTY */}
        {sortedHistory.length === 0 && (
          <p className="text-gray-400 text-center mt-20">
            No analysis yet. Start verifying 🚀
          </p>
        )}

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {sortedHistory.map(item => (
            <HistoryCard
              key={item.id}              // 🔥 MUST be Firestore doc.id
              data={item}
              onClick={() => setSelected(item)}
              onDelete={handleDelete}   // 🔥 PASS DELETE
            />
          ))}
        </div>

        {/* MODAL */}
        {selected && (
          <ResultModal
            data={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}