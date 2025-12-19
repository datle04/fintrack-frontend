import React, { useState, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { formatCurrency, getCurrencyInfo } from "../../utils/formatCurrency";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#3B82F6",
];

const DonutChart = ({ budget }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { t, i18n } = useTranslation();

  const categoryStats = budget?.categoryStats || [];
  const totalBudget = budget?.totalBudget || 0;

  const { displayCurrency, exchangeRate } = useMemo(
    () => getCurrencyInfo(budget),
    [budget]
  );

  const processedStats = useMemo(() => {
    return categoryStats
      .map((item) => {
        const baseAmount = item.spentAmount;
        const displayAmount = baseAmount / exchangeRate;

        return {
          ...item,
          baseAmount: baseAmount,
          displayAmount: displayAmount,
        };
      })
      .filter((item) => item.baseAmount > 0);
  }, [categoryStats, exchangeRate]);

  const chartData = {
    labels: processedStats.map((item) => item.category),
    datasets: [
      {
        data: processedStats.map((item) => item.baseAmount),
        backgroundColor: COLORS,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        color: "#fff",
        font: { weight: "bold", size: 13 },
        formatter: (value) => {
          const percent = totalBudget
            ? ((value / totalBudget) * 100).toFixed(0)
            : 0;
          return `${percent}%`;
        },
      },
    },
    onHover: (event, elements) => {
      if (elements.length > 0) {
        setActiveIndex(elements[0].index);
      } else {
        setActiveIndex(null);
      }
    },
    elements: {
      arc: {},
    },
  };

  const centerData =
    activeIndex !== null && processedStats[activeIndex]
      ? {
          label: processedStats[activeIndex].category,

          formattedAmount: formatCurrency(
            processedStats[activeIndex].displayAmount,
            displayCurrency,
            i18n.language
          ),

          percent: totalBudget
            ? (
                (processedStats[activeIndex].baseAmount / totalBudget) *
                100
              ).toFixed(0)
            : 0,
        }
      : null;

  return (
    <div className="relative w-full max-w-[320px] h-[280px] mx-auto">
      <Doughnut
        data={chartData}
        options={options}
        plugins={[ChartDataLabels]}
      />

      {centerData && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none">
          <div className="text-[14px] text-gray-700 font-medium dark:text-white">
            {t(`categories.${centerData.label}`)} - {centerData.percent}%
          </div>
          <div className="text-[12px] text-gray-900 font-semibold mt-1 dark:text-white/83">
            {centerData.formattedAmount}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonutChart;
