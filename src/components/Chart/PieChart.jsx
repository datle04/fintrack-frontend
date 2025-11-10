import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import useWindowWidth from "../../utils/useWindowWidth";
import PieChartLoading from "../Loading/DashboardLoading/PieChartLoading";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatCurrency";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ stats, loading, userCurrency }) => {
  const { t, i18n } = useTranslation();
  const width = useWindowWidth();

  const COLORS = [
    "#5D43DB",
    "#D1CDFB",
    "#4ade80",
    "#60a5fa",
    "#facc15",
    "#f87171",
    "#fbbf24",
    "#34d399",
  ];

  const getFontSize = () => {
    if (width < 640) return 12;
    if (width < 768) return 14;
    if (width < 1024) return 15;
    if (width < 1280) return 16;
    if (width < 1600) return 17;
    return 18;
  };

  const isDarkMode = document.documentElement.classList.contains("dark");
  const totalAmount = stats.reduce((acc, item) => acc + item.displayAmount, 0);

  const data = {
    labels: stats.map((stat) => stat.category),
    datasets: [
      {
        label: "Stats",
        data: stats.map((stat) => stat.displayAmount),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: width >= 640 ? "right" : "bottom",
        labels: {
          boxWidth: width >= 640 ? 20 : 10,
          padding: width >= 640 ? 20 : 10,
          font: {
            size: getFontSize(),
          },
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            return chart.data.labels.map((label, i) => {
              const hidden = meta.data[i]?.hidden || false;
              const translatedLabel = t(`categories.${label}`) || label;
              const color = dataset.backgroundColor[i];

              return {
                text: translatedLabel,
                fillStyle: color,
                strokeStyle: color,
                hidden,
                fontColor: hidden
                  ? isDarkMode
                    ? "#7c7c7c"
                    : "#999"
                  : isDarkMode
                  ? "#e0e0e0"
                  : "#2e2e2e",
              };
            });
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const value = context.raw || 0;
            const percent = totalAmount
              ? ((value / totalAmount) * 100).toFixed(1)
              : "0";
            const rawLabel = context.label;
            const translatedLabel = t(`categories.${rawLabel}`) || rawLabel;
            return `${translatedLabel}: ${formatCurrency(
              value,
              userCurrency,
              i18n.language
            )} (${percent}%)`;
          },
        },
      },
    },
  };

  if (loading) return <PieChartLoading />;
  if (!loading && stats.length === 0)
    return (
      <div className="w-full h-full p-5 flex justify-center items-center font-semibold 3xl:text-xl dark:text-white/87">
        {t("noData")}
      </div>
    );

  return <Pie data={data} options={options} />;
};

export default PieChart;
