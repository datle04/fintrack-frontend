import React, { useState, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { formatCurrency, getCurrencyInfo } from "../../utils/formatCurrency"; // Import helper của bạn

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

// --- SỬA 1: CHỈ NHẬN 1 PROP 'budget' ---
const DonutChart = ({ budget }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { t, i18n } = useTranslation();

  // --- SỬA 2: Trích xuất dữ liệu từ 'budget' ---
  // Dùng '?' để tránh lỗi nếu 'budget' ban đầu là null/undefined
  const categoryStats = budget?.categoryStats || [];
  const totalBudget = budget?.totalBudget || 0; // Đây là base amount (VND)

  // Lấy thông tin tiền tệ (ví dụ: { displayCurrency: "EUR", exchangeRate: 27000 })
  const { displayCurrency, exchangeRate } = useMemo(
    () => getCurrencyInfo(budget),
    [budget]
  );

  // Xử lý mảng categoryStats (thêm displayAmount)
  const processedStats = useMemo(() => {
    return categoryStats
      .map((item) => {
        const baseAmount = item.spentAmount; // spentAmount từ API là base (VND)
        const displayAmount = baseAmount / exchangeRate; // Quy đổi sang EUR/USD...

        return {
          ...item,
          baseAmount: baseAmount,
          displayAmount: displayAmount,
        };
      })
      .filter((item) => item.baseAmount > 0);
  }, [categoryStats, exchangeRate]);

  // Dùng 'baseAmount' (VND) để vẽ biểu đồ
  const chartData = {
    labels: processedStats.map((item) => item.category),
    datasets: [
      {
        data: processedStats.map((item) => item.baseAmount), // Luôn dùng base
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
          // 'value' là baseAmount, 'totalBudget' là baseTotalBudget
          // Cả hai đều là VND, nên phép tính này ĐÚNG
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
      arc: {
        /* ... (không đổi) */
      },
    },
  };

  // --- SỬA 3: Cập nhật centerData để dùng formatCurrency ---
  const centerData =
    activeIndex !== null && processedStats[activeIndex]
      ? {
          label: processedStats[activeIndex].category,

          // Dùng hàm formatCurrency mới
          formattedAmount: formatCurrency(
            processedStats[activeIndex].displayAmount, // Số tiền (ví dụ: 100.5)
            displayCurrency, // Tiền tệ (ví dụ: "EUR")
            i18n.language // Ngôn ngữ (ví dụ: "vi")
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
            {/* --- SỬA 4: Chỉ cần render 1 biến duy nhất --- */}
            {centerData.formattedAmount}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonutChart;
