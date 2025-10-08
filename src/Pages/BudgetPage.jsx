import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBudget } from "../features/budgetSlice";
import formatCurrencyVN from "../utils/formatCurrency";
import MyBudgetCircle from "../components/BudgetPageComponent/MyBudgetCircle";
import BudgetByCategory from "../components/BudgetPageComponent/BudgetByCategory";
import BudgetModal from "../components/BudgetPageComponent/BudgetModal";
import BudgetPageLoading from "../components/Loading/BudgetLoading/BudgetPageLoading";
import { useTranslation } from "react-i18next";

const BudgetPage = () => {
  const now = new Date();
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const budget = useSelector((state) => state.budget);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const categoryList = [
    { key: "sales", icon: "🛍️", color: "#f87171" }, // đỏ hồng
    { key: "transportation", icon: "🚗", color: "#60a5fa" }, // xanh dương nhạt
    { key: "education", icon: "📚", color: "#fbbf24" }, // vàng
    { key: "entertainment", icon: "🎮", color: "#a78bfa" }, // tím nhạt
    { key: "shopping", icon: "🛒", color: "#fb923c" }, // cam sáng
    { key: "housing", icon: "🏠", color: "#34d399" }, // xanh lá nhạt
    { key: "health", icon: "🩺", color: "#ef4444" }, // đỏ
    { key: "rent", icon: "🏘️", color: "#4ade80" }, // xanh lá sáng
    { key: "bonus", icon: "🎁", color: "#facc15" }, // vàng sáng
    { key: "salary", icon: "💰", color: "#22c55e" }, // xanh lá cây
    { key: "food", icon: "🍽️", color: "#c084fc" }, // tím
    { key: "investment", icon: "📈", color: "#0ea5e9" }, // xanh cyan
  ];

  useEffect(() => {
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    dispatch(getBudget({ month: currentMonth, year: currentYear }));
  }, []);

  useEffect(() => {
    console.log("Budget:", budget);
  }, [budget]);

  const monthValues = Array.from({ length: 12 }, (_, i) => ({
    title: i + 1,
    value: i + 1,
  }));

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  const fetchBudget = async () => {
    await dispatch(getBudget({ month: selectedMonth, year: selectedYear }));
  };

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth, selectedYear]);

  if (budget.loading) return <BudgetPageLoading />;

  return (
    <section
      className="
        relative w-full px-2 py-4 flex flex-col gap-4 items-center
        sm:p-4
        lg:p-6
        xl:w-[90%] xl:mx-auto
    "
    >
      <h2 className="self-start text-3xl text-[#464646] font-extrabold lg:hidden dark:text-white/87">
        {t("budget")}
      </h2>

      <div
        className="
          w-full flex flex-col gap-3
          lg:grid lg:grid-cols-[65%_35%]
      "
      >
        {/* Date Selector */}
        <section className="w-full flex justify-between gap-3 lg:order-2 lg:flex-col lg:gap-1 ">
          <div className="flex-1 flex flex-col gap-2 text-base lg:gap-3">
            <span className="text-[#464646] font-semibold text-lg dark:text-white/87">
              {t("month")}
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              name="months"
              className="
              p-2 border border-slate-300 bg-white rounded text-slate-600 outline-none cursor-pointer dark:text-white/87 dark:border-slate-700 dark:bg-[#2E2E33]
          "
            >
              {monthValues.map((item, index) => (
                <option
                  key={index}
                  value={item.value}
                  className="
                
              "
                >
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-[#464646] font-semibold text-lg dark:text-white/87">
              {t("year")}
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              name="years"
              className="
              p-2 border border-slate-300 bg-white rounded text-slate-600 outline-none cursor-pointer dark:text-white/87 dark:border-slate-700 dark:bg-[#2E2E33]
            "
            >
              {years.map((item, index) => (
                <option
                  key={index}
                  value={item}
                  className="
                
                "
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1"></div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="
                flex-1 font-bold text-lg bg-[#767CFF] text-[#FFF7FF] rounded cursor-pointer hover:bg-[#8476ff] dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all
                lg:self-start lg:px-8
          "
            >
              + {t("add")}
            </button>
          </div>
        </section>

        {isFormOpen && (
          <BudgetModal
            categoryList={categoryList}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setIsFormOpen={setIsFormOpen}
            monthValues={monthValues}
            years={years}
            token={token}
            onClose={() => {
              fetchBudget();
            }}
          />
        )}

        {/* Total budget */}
        {budget.month ? (
          <section
            className="
          w-full p-3 bg-white rounded flex gap-2 dark:bg-[#2E2E33] dark:border dark:border-slate-700
          sm:p-4 sm:gap-0
          lg:order-1
      "
          >
            <div className="flex-1 flex flex-col gap-3 sm:justify-center sm:gap-4 sm:text-lg sm:p-3">
              <div className="flex flex-col gap-1 sm:flex-row">
                <p className="text-[#464646] font-semibold dark:text-white/83">
                  {t("totalBudget")}:
                </p>
                <span className="text-[#767CFF] dark:text-indigo-600">
                  {formatCurrencyVN(budget.totalBudget)} đ
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row">
                <p className="text-[#464646] font-semibold dark:text-white/83">
                  {t("totalSpent")}:
                </p>
                <span className="text-red-500 dark:text-red-600">
                  {formatCurrencyVN(budget.totalSpent)} đ
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row">
                <p className="text-[#464646] font-semibold dark:text-white/83">
                  {t("totalRemain")}:
                </p>
                <span className="text-green-500 dark:text-green-600">
                  {formatCurrencyVN(+budget.totalBudget - +budget.totalSpent)} đ
                </span>
              </div>
            </div>

            <div className="flex-1 self-center flex flex-col items-center gap-5">
              <MyBudgetCircle percentage={budget.totalPercentUsed} />
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="p-2 rounded-full bg-[#6C2BD9]"></div>
                  <span className="text-[#464646] dark:text-white/83">
                    {t("spent")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="p-2 rounded-full bg-[#e6e6fa]"></div>
                  <span className="text-[#464646] dark:text-white/83">
                    {t("remaining")}
                  </span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="w-full h-32 p-3 flex justify-center items-center bg-white rounded text-[#464646] text-lg font-semibold dark:bg-[#2E2E33] dark:text-white/87">
            <h2>{t("noData")}</h2>
          </section>
        )}
      </div>

      {/* Budget by category */}
      <section
        className="
            w-full p-3 bg-white rounded flex flex-col gap-2 dark:bg-[#2E2E33] dark:border dark:border-slate-700
            sm:p-4
            lg:p-6
            xl:w-full
      "
      >
        <h2 className="text-[#464646] font-bold sm:text-lg dark:text-white/87">
          {t("categories.title")}
        </h2>
        <hr className="text-[#464646] h-1 w-full my-1 dark:text-slate-600" />

        <BudgetByCategory
          categoryList={categoryList}
          categoryStats={budget.categoryStats}
        />
      </section>
    </section>
  );
};

export default BudgetPage;
