import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactionsByMonth } from "../features/transactionSlice";
import { getBudget } from "../features/budgetSlice";
import DonutChart from "../components/Chart/DonutChart";
import ReportExport from "./ReportExport";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/formatCurrency";
import { MONTH_NAMES } from "../constant/months";

const StatPage = () => {
  const dispatch = useDispatch();
  const now = new Date();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [month, setMonth] = useState(now.getMonth() + 1); // UI: 1-12
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const budget = useSelector((state) => state.budget);

  useEffect(() => {
    const fetchData = async () => {
      const res = await dispatch(getTransactionsByMonth({ month, year }));
      if (res.payload?.data) setTransactions(res.payload.data);
      await dispatch(getBudget({ month, year }));
    };
    fetchData();
  }, [month, year, dispatch]);

  const getDaysInMonth = (month, year) => {
    const totalDays = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0 (Sun) – 6 (Sat)
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return {
      days,
      firstDay: (firstDay + 6) % 7, // convert to Mon–Sun
      totalDays,
    };
  };

  const { days, firstDay, totalDays } = getDaysInMonth(month, year);
  const budgetPerDay = totalDays
    ? Math.floor(budget.totalBudget / totalDays)
    : 0;

  const transactionsByDayMap = useMemo(() => {
    const map = {};
    for (let i = 1; i <= totalDays; i++) map[i] = [];

    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      if (date.getFullYear() === year && date.getMonth() === month - 1) {
        const day = date.getDate();
        map[day].push(tx);
      }
    });

    return map;
  }, [transactions, month, year, totalDays]);

  const maxExpenseInMonth = useMemo(() => {
    let max = 0;
    for (let i = 1; i <= totalDays; i++) {
      const expense =
        transactionsByDayMap[i]
          ?.filter((t) => t.type === "expense") // SỬA LỖI: Thêm (t.exchangeRate || 1)
          .reduce((s, t) => s + t.amount * (t.exchangeRate || 1), 0) || 0;
      if (expense > max) max = expense;
    }
    return max;
  }, [transactionsByDayMap, totalDays]);

  const transactionsByDay = selectedDate
    ? transactionsByDayMap[selectedDate]
    : [];

  const getHeatmapColor = (percent) => {
    // console.log(percent);

    if (percent >= 70) return "bg-[#5D43DB] text-white";
    if (percent >= 40) return "bg-[#A596E7] text-white";
    if (percent >= 20) return "bg-[#B8A9F0] text-purple-900";
    if (percent > 0) return "bg-[#D6CFFA] text-purple-900";
    return "bg-[#F2EEFF] text-purple-900";
  };

  const shouldShowReport = useMemo(() => {
    const isCurrentMonth =
      month === now.getMonth() + 1 && year === now.getFullYear();
    const isPastMonth =
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1);
    const totalDays = new Date(year, month, 0).getDate();

    return isPastMonth || (isCurrentMonth && now.getDate() >= totalDays);
  }, [month, year, now]);

  return (
    <div className="w-full min-h-screen bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-6 xl:p-8">
      {/* --- 1. HEADER & FILTER (Trải dài trên cùng) --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t("statPage.title")}
        </h1>

        {/* Bộ chọn Tháng/Năm (Gom gọn lại) */}
        <div className="flex items-center bg-white dark:bg-[#2E2E33] p-1 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
          <div className="px-2 border-r border-gray-200 dark:border-gray-600">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent outline-none text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer py-1"
            >
              {MONTH_NAMES[currentLang].map((label, index) => (
                <option
                  key={index}
                  value={index + 1}
                  className="dark:bg-[#2E2E33]"
                >
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="px-2">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent outline-none text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer py-1"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i} value={2020 + i} className="dark:bg-[#2E2E33]">
                  {2020 + i}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN GRID LAYOUT (3 Cột) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
        {/* === CỘT TRÁI: BIỂU ĐỒ (Chiếm 3 phần) === */}
        <div className="lg:col-span-3 bg-white dark:bg-[#2E2E33] rounded-2xl shadow-sm p-4 flex flex-col border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold mb-4 text-center text-gray-700 dark:text-white">
            {t("statByCat")}
          </h3>

          <div className="flex-1 flex items-center justify-center relative">
            {budget.totalBudget > 0 ? (
              <div className="scale-90">
                {/* Thu nhỏ chart một chút */}
                <DonutChart
                  categoryStats={budget.categoryStats}
                  totalBudget={budget.totalBudget}
                  budget={budget}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm">
                <p>{t("statPage.noBudget")}</p>
              </div>
            )}
          </div>

          {/* Nút xuất báo cáo (Đặt ở dưới cùng cột trái) */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {shouldShowReport && <ReportExport month={month} year={year} />}
          </div>
        </div>

        {/* === CỘT GIỮA: LỊCH HEATMAP (Chiếm 6 phần - Rộng nhất) === */}
        <div className="lg:col-span-6 bg-white dark:bg-[#2E2E33] rounded-2xl shadow-sm p-6 flex flex-col border border-gray-100 dark:border-slate-700">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 mb-2">
            {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d, i) => (
              <div
                key={i}
                className="text-center text-xs font-medium text-gray-400 uppercase"
              >
                {t(`statPage.weekdays.${d}`)}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 gap-2 auto-rows-fr">
            {/* auto-rows-fr giúp ô vuông đều nhau */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              // ... (Logic tính toán cũ của bạn giữ nguyên)
              const dailyTx = transactionsByDayMap[day] || [];
              const income = dailyTx
                .filter((t) => t.type === "income")
                .reduce((s, t) => s + t.amount * (t.exchangeRate || 1), 0);
              const expense = dailyTx
                .filter((t) => t.type === "expense")
                .reduce((s, t) => s + t.amount * (t.exchangeRate || 1), 0);
              const hasData = expense > 0 || income > 0;
              const isSelected = selectedDate === day;

              // Tính opacity cho Heatmap
              const opacity =
                maxExpenseInMonth > 0
                  ? Math.min(expense / maxExpenseInMonth + 0.2, 1)
                  : 0;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 aspect-square
                    ${
                      isSelected
                        ? "ring-2 ring-indigo-500 ring-offset-2 z-10"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }
                  `}
                  style={
                    expense > 0
                      ? {
                          backgroundColor: `rgba(99, 102, 241, ${opacity})`, // Indigo
                          color: opacity > 0.6 ? "white" : "inherit",
                        }
                      : {}
                  }
                >
                  <span
                    className={`text-sm font-medium ${
                      !hasData ? "text-gray-400" : ""
                    }`}
                  >
                    {day}
                  </span>

                  {/* Dot Indicator */}
                  <div className="flex gap-1 mt-1 h-1.5">
                    {income > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === CỘT PHẢI: CHI TIẾT GIAO DỊCH (Chiếm 3 phần) === */}
        <div className="lg:col-span-3 bg-white dark:bg-[#2E2E33] rounded-2xl shadow-sm p-4 flex flex-col h-full border border-gray-100 dark:border-slate-700 overflow-hidden">
          <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-white border-b pb-2 dark:border-slate-700">
            {selectedDate
              ? t("statPage.transactionsOfDay", { day: selectedDate, month })
              : t("statPage.selectDay")}
          </h3>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {selectedDate && transactionsByDay.length > 0 ? (
              <ul className="space-y-3">
                {transactionsByDay.map((tx) => (
                  <li
                    key={tx._id}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {t(`categories.${tx.category}`)}
                      </p>
                      {tx.note && (
                        <p className="text-xs text-gray-400 truncate max-w-[120px]">
                          {tx.note}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        tx.type === "income" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(
                        parseInt(tx.amount),
                        tx.currency,
                        i18n.language
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              // Empty State
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                <div className="text-4xl">📅</div>
                <p className="text-xs text-center">
                  {t("statPage.noTransactions")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatPage;
