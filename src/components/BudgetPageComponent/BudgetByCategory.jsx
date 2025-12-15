// src/components/BudgetPageComponent/BudgetByCategory.jsx
import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { IoWarningOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { getCurrencySymbol } from "../../constant/currencies";

const BudgetByCategory = ({ categoryList, categoryStats, currency }) => {
  const { t, i18n } = useTranslation();

  // Helper lấy icon và màu sắc
  const getCategoryMeta = (key) => {
    const found = categoryList.find((c) => c.key === key);
    return found
      ? {
          label: t(`categories.${found.key}`),
          icon: found.icon,
          color: found.color,
        }
      : { label: key, icon: "❓", color: "#ccc" };
  };

  if (!categoryStats || categoryStats.length === 0) {
    return (
      <div className="w-full py-10 flex flex-col items-center justify-center bg-white dark:bg-[#2E2E33] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400">
        <p className="text-lg font-medium">{t("noData")}</p>
        <p className="text-sm">Hãy thêm ngân sách đầu tiên của bạn!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 2xl:gap-6">
      {categoryStats.map((item) => {
        // Dữ liệu này ĐÃ ĐƯỢC TÍNH TOÁN bởi useBudgetCalculations
        // Chúng ta chỉ việc hiển thị
        const { displayBudget, displaySpent, percentUsed, isOver } = item;
        const percent = Math.min(percentUsed || 0, 100); // Max 100 cho thanh bar
        const { label, icon } = getCategoryMeta(item.category);

        // Màu sắc thanh tiến độ
        let progressColor = "bg-green-500";
        if (isOver) progressColor = "bg-red-500";
        else if (percent > 80) progressColor = "bg-yellow-500";
        else if (percent > 50) progressColor = "bg-indigo-500";

        return (
          <div
            key={item.category}
            className="group bg-white dark:bg-[#2E2E33] p-4 2xl:p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            {/* Header: Icon & Title & Total */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-xl 2xl:text-2xl shadow-inner">
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm 2xl:text-base">
                    {label}
                  </h3>
                  <p className="text-xs 2xl:text-sm text-gray-400">
                    {formatCurrency(displayBudget, currency, i18n.language)}
                  </p>
                </div>
              </div>

              {/* Cảnh báo nếu vượt */}
              {isOver && (
                <div
                  className="animate-pulse text-red-500"
                  title="Vượt ngân sách"
                >
                  <IoWarningOutline size={20} />
                </div>
              )}
            </div>

            {/* Progress Bar Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs 2xl:text-sm font-medium">
                <span
                  className={
                    isOver ? "text-red-500" : "text-gray-600 dark:text-gray-400"
                  }
                >
                  {t("spent")}:{" "}
                  {formatCurrency(displaySpent, currency, i18n.language)}
                </span>
                <span className={isOver ? "text-red-600" : "text-indigo-600"}>
                  {percentUsed.toFixed(1)}%
                </span>
              </div>

              <div className="relative w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progressColor} transition-all duration-1000 ease-out`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetByCategory;
