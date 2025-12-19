import React, { useMemo, useState } from "react";
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
import { format, parseISO, isSameWeek, isSameMonth, getDay } from "date-fns";

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

function getDurationInHours(session) {
  const start = parseISO(session.loginAt);
  const end = parseISO(session.logoutAt);
  return (end - start) / (1000 * 60 * 60);
}

export default function SessionDurationChart({ sessions = [] }) {
  const [mode, setMode] = useState("week");

  const weeklyDurations = useMemo(() => {
    const now = new Date();

    const durations = Array(7).fill(0);
    const counts = Array(7).fill(0);

    sessions.forEach((session) => {
      if (!session.loginAt || !session.logoutAt) return;

      const loginDate = parseISO(session.loginAt);
      const logoutDate = parseISO(session.logoutAt);

      if (mode === "week" && !isSameWeek(loginDate, now, { weekStartsOn: 1 }))
        return;
      if (mode === "month" && !isSameMonth(loginDate, now)) return;

      const duration = getDurationInHours(session);
      const day = getDay(loginDate);

      durations[day] += duration;
      counts[day]++;
    });

    if (mode === "month") {
      for (let i = 0; i < 7; i++) {
        durations[i] = counts[i] ? durations[i] / counts[i] : 0;
      }
    }

    return durations;
  }, [sessions, mode]);

  const chartData = {
    labels: WEEK_DAYS,
    datasets: [
      {
        label:
          mode === "week"
            ? "Tổng thời lượng (giờ)"
            : "Trung bình mỗi ngày (giờ)",
        data: weeklyDurations,
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(5, 150, 105, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(5, 150, 105, 0.9)",
        barThickness: 32,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text:
          mode === "week"
            ? "Thời lượng sử dụng trong tuần này"
            : "Trung bình thời lượng mỗi ngày trong tháng",
        font: { size: 18 },
        color: "#111827",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y.toFixed(1)} giờ`,
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
    <div className="w-full max-w-5xl h-[400px] mx-auto px-4">
      <div className="flex justify-end mb-2">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700"
        >
          <option value="week">Tuần này</option>
          <option value="month">Trung bình tháng</option>
        </select>
      </div>

      {weeklyDurations.every((d) => d === 0) ? (
        <p className="text-center text-gray-500 mt-8">Không có dữ liệu.</p>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}
