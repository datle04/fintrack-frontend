import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactionsByMonth } from "../features/transactionSlice";
import { getBudget } from "../features/budgetSlice";
import DonutChart from "../components/Chart/DonutChart";
import ReportExport from "./ReportExport";
import { useTranslation } from "react-i18next";

const StatPage = () => {
  const dispatch = useDispatch();
  const now = new Date();
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useState(now.getMonth() + 1); // UI: 1-12
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const { totalBudget, categoryStats } = useSelector((state) => state.budget);

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
  const budgetPerDay = totalDays ? Math.floor(totalBudget / totalDays) : 0;

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
          ?.filter((t) => t.type === "expense")
          .reduce((s, t) => s + t.amount, 0) || 0;
      if (expense > max) max = expense;
    }
    return max;
  }, [transactionsByDayMap, totalDays]);

  const transactionsByDay = selectedDate
    ? transactionsByDayMap[selectedDate]
    : [];

  const getHeatmapColor = (percent) => {
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
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 w-full max-w-screen-2xl mx-auto md:h-[640px]">
      {/* Calendar */}
      <div className="w-full flex flex-col md:w-[60%] bg-white rounded-xl shadow-md p-4 md:p-6 md:h-full dark:bg-[#2E2E33] dark:border dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border rounded px-2 py-1 dark:border-slate-700 dark:text-white/83 cursor-pointer"
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <option
                  key={idx}
                  value={idx + 1}
                  className="dark:bg-[#2E2E33] dark:text-white/83"
                >
                  {t("month")} {idx + 1}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border rounded px-2 py-1 dark:border-slate-700 dark:text-white/83 cursor-pointer"
            >
              {Array.from({ length: 10 }).map((_, idx) => {
                const y = 2020 + idx;
                return (
                  <option
                    key={idx}
                    value={y}
                    className="dark:bg-[#2E2E33] dark:text-white/83"
                  >
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-700 mb-2 dark:text-white/83">
          {[
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].map((d, i) => (
            <div key={i}>{t(d)}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`}></div>
          ))}
          {days.map((day) => {
            const dailyTx = transactionsByDayMap[day] || [];
            const income = dailyTx
              .filter((t) => t.type === "income")
              .reduce((s, t) => s + t.amount, 0);
            const expense = dailyTx
              .filter((t) => t.type === "expense")
              .reduce((s, t) => s + t.amount, 0);
            const percent = totalBudget
              ? (expense / budgetPerDay) * 100
              : maxExpenseInMonth > 0
              ? (expense / maxExpenseInMonth) * 100
              : 0;

            const bgColor = getHeatmapColor(percent);

            const isSelected = selectedDate === day;
            return (
              <div
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`cursor-pointer border rounded-md p-2 text-[11px] transition-all hover:scale-[1.02] ${bgColor} ${
                  isSelected ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <div className="font-semibold text-sm">{day}</div>
                <div className="truncate text-[10px] leading-tight max-w-full">
                  {expense.toLocaleString()}đ
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-full h-full overflow-hidden flex flex-col justify-end 3xl:text-lg">
          {shouldShowReport && <ReportExport month={month} year={year} />}
        </div>
      </div>

      {/* Cột phải: Giao dịch + Donut */}
      <div className="w-full md:w-[40%] md:h-full flex flex-col gap-4 ">
        <div className="bg-white rounded-xl shadow-md p-4 flex-1 flex flex-col overflow-hidden dark:bg-[#2E2E33] dark:border dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-3 dark:text-white/87">
            {t("transactions")}{" "}
            {selectedDate
              ? `${selectedDate}/${month}/${year}`
              : `(${t("selectDate")})`}
          </h3>
          <div className="overflow-y-auto pr-2 flex-1">
            {selectedDate ? (
              transactionsByDay.length > 0 ? (
                <ul className="text-sm space-y-2">
                  {transactionsByDay.map((tx) => (
                    <li
                      key={tx._id}
                      className="flex justify-between border-b pb-1 text-gray-700 dark:text-white/83 dark:border-slate-600"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {t(`categories.${tx.category}`)}
                        </span>
                        {tx.note && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {tx.note}
                          </span>
                        )}
                      </div>
                      <span
                        className={
                          tx.type === "income"
                            ? "text-green-500 dark:text-green-600"
                            : "text-red-500 dark:text-red-600"
                        }
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {parseInt(tx.amount).toLocaleString()}đ
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-white/83">
                  {t("noData")}.
                </p>
              )
            ) : (
              <p className="text-sm text-gray-500 dark:text-white/83">
                {t("pleaseSelectDate")}.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 flex-1 flex flex-col items-center justify-center dark:bg-[#2E2E33] dark:border dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-3 dark:text-white/83">
            {t("statByCat")}
          </h3>
          {totalBudget > 0 ? (
            <DonutChart
              categoryStats={categoryStats}
              totalBudget={totalBudget}
            />
          ) : (
            <div className="text-center text-gray-500 flex flex-col items-center gap-2 dark:text-white/83">
              <div className="text-4xl">💸</div>
              <p className="text-sm">{t("noBudget")}</p>
              <p className="text-xs text-gray-400">{t("pleaseSetBudget")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatPage;
