import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend
);

const WEEK_DAYS = {
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
  7: "CN",
};

export default function WeeklyDurationChart({ data, mode, setMode }) {
  if (!data?.result) return <p>Không có dữ liệu.</p>;

  const chartData = {
    labels: Object.keys(WEEK_DAYS).map((key) => WEEK_DAYS[key]),
    datasets: [
      {
        label:
          data.mode === "avg4weeks"
            ? "Trung bình mỗi ngày (giờ)"
            : "Tổng thời lượng (giờ)",
        data: Object.keys(WEEK_DAYS).map(
          (day) => (data.result[day] || 0) / 3600
        ),
        backgroundColor: "rgba(96, 165, 250, 0.6)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(37, 99, 235, 0.9)",
        barThickness: 32,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        font: { size: 18 },
        color: "#111827",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y.toFixed(2)} giờ`,
        },
      },
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#4b5563",
        },
        grid: { color: "#e5e7eb" },
      },
      x: {
        ticks: { color: "#4b5563" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 bg-white shadow-lg rounded-lg p-6 border border-slate-300">
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-xl text-center font-semibold text-gray-800">
          Thời lượng sử dụng
        </h2>
        {data.totalUsers && (
          <p className="text-sm text-gray-500 italic">
            Dựa trên {data.totalUsers} người dùng
          </p>
        )}
      </div>

      {/* Nút chuyển mode */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setMode("week")}
          className={`px-3 py-1 rounded-l border border-gray-300 text-sm cursor-pointer ${
            mode === "week"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tuần này
        </button>
        <button
          onClick={() => setMode("avg4week")}
          className={`px-3 py-1 rounded-r border border-l-0 border-gray-300 text-sm cursor-pointer ${
            mode === "avg4week"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Trung bình 4 tuần
        </button>
      </div>

      {/* Biểu đồ */}
      <div className="h-[360px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
