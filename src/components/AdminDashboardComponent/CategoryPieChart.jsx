import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTranslation } from "react-i18next";

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (amount) => {
  return amount.toLocaleString("vi-VN") + "₫";
};

const CategoryPieChart = ({ data }) => {
  const { t, i18n } = useTranslation();
  if (!data || data.length === 0) return <p>{t("noData")}</p>;

  const topCategories = [...data].sort((a, b) => b.total - a.total).slice(0, 8);

  const chartData = {
    labels: topCategories.map((item) => t(`categories.${item._id}`)),
    datasets: [
      {
        data: topCategories.map((item) => item.total),
        backgroundColor: [
          "#4BC0C0",
          "#FF6384",
          "#FFCE56",
          "#36A2EB",
          "#9966FF",
          "#FF9F40",
          "#8BC34A",
          "#E91E63",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 16,
            weight: "500",
          },
          boxWidth: 20,
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
  };

  const total = topCategories.reduce((acc, cur) => acc + cur.total, 0);

  return (
    <div className="p-4 bg-white rounded-xl shadow-xl border border-slate-300 max-h-[500px] max-w-5xl ">
      <h2 className="my-2 text-center text-xl text-gray-800 font-semibold">
        Danh mục được sử dụng nhiều
      </h2>
      <div className="mx-auto flex items-center justify-between gap-4">
        <div className="w-[60%] h-[400px]">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
        <div className="w-[30%] text-center">
          <h2 className="text-xl font-bold mb-2 text-gray-700">
            Tổng chi top danh mục
          </h2>
          <div className="text-[22px] font-semibold text-indigo-600">
            {formatCurrency(total)}
          </div>
          <p className="text-sm text-gray-500 italic mt-2">
            * Chỉ hiển thị 8 danh mục có tổng chi lớn nhất
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryPieChart;
