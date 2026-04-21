import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Analytics({ data }) {
  const analysisData = data.map(d => d.result?.analysis || {});

  const total = analysisData.length;
  const real = analysisData.filter(a => a.verdict === "Real").length;
  const fake = total - real;

  // ✅ PIE DATA
  const pieData = [
    { name: "Real", value: real || 1 },
    { name: "Fake", value: fake || 1 },
  ];

  // ✅ BAR DATA FIX
  const barMap = {};

  data.forEach(item => {
    if (!item.createdAt) return;

    const date = new Date(
      item.createdAt._seconds
        ? item.createdAt._seconds * 1000
        : item.createdAt
    ).toLocaleDateString();

    barMap[date] = (barMap[date] || 0) + 1;
  });

  const barData = Object.keys(barMap).map(date => ({
    date,
    count: barMap[date],
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-10">

      {/* 📊 STATS */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-white/10">
        <h2 className="text-lg font-semibold mb-4 text-white">📊 Overview</h2>

        <p>Total: {total}</p>
        <p className="text-green-400">Real: {real}</p>
        <p className="text-red-400">Fake: {fake}</p>
      </div>

      {/* 🧠 PIE */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-white/10">
        <h2 className="mb-4 text-white">🧠 Truth Distribution</h2>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={80}>
              <Cell fill="#22c55e" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 📈 BAR FIXED */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-white/10 md:col-span-2">
        <h2 className="mb-4 text-white">📈 Activity</h2>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            
            {/* ✅ GRID */}
            <CartesianGrid stroke="#333" />

            {/* ✅ AXIS COLOR FIX */}
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />

            <Tooltip />

            {/* ✅ BAR COLOR FIX */}
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}