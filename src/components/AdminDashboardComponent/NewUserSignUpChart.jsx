import React, { useEffect, useState } from "react";
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
import axiosInstance from "../../api/axiosInstance";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend
);

const NewUserSignupsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSignups = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          "/api/admin/dashboard/user-signups"
        );
        const apiData = res.data;

        const labels = [];
        const dataCounts = [];

        const dataMap = new Map(apiData.map((item) => [item._id, item.count]));

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);

          const dateStringISO = d.toISOString().split("T")[0];

          const displayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

          labels.push(displayLabel);
          dataCounts.push(dataMap.get(dateStringISO) || 0);
        }

        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Số lượng đăng ký mới",
              data: dataCounts,
              backgroundColor: "rgba(34, 197, 94, 0.6)", // Màu xanh lá
              borderColor: "rgba(22, 163, 74, 1)",
              borderWidth: 1,
              borderRadius: 6,
              hoverBackgroundColor: "rgba(22, 163, 74, 0.9)",
              barThickness: 32,
            },
          ],
        });
      } catch (err) {
        console.error("Lỗi khi tải thống kê đăng ký:", err);
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSignups();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} lượt đăng ký`,
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

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500 text-center">Đang tải dữ liệu...</p>;
    }
    if (error) {
      return <p className="text-red-500 text-center">{error}</p>;
    }
    if (chartData) {
      return (
        <div className="h-[360px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-6 border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Tăng trưởng Người dùng (7 ngày)
        </h2>
      </div>
      {renderContent()}
    </div>
  );
};

export default NewUserSignupsChart;
