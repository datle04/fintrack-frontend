import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBudget } from "../features/budgetSlice";
import formatCurrencyVN from "../utils/formatCurrency";
import MyBudgetCircle from "../components/BudgetPageComponent/MyBudgetCircle";
import BudgetByCategory from "../components/BudgetPageComponent/BudgetByCategory";
import BudgetModal from "../components/BudgetPageComponent/BudgetModal";

const BudgetPage = () => {
  const now = new Date();
  const dispatch = useDispatch();
  const budget = useSelector((state) => state.budget);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    dispatch(getBudget({ month: currentMonth, year: currentYear }));
  }, []);

  useEffect(() => {
    console.log("Budget:", budget);
  }, [budget]);

  const monthValues = Array.from({ length: 12 }, (_, i) => ({
    title: new Date(0, i).toLocaleString("default", { month: "short" }),
    value: i + 1,
  }));

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  useEffect(() => {
    dispatch(getBudget({ month: selectedMonth, year: selectedYear }));
  }, [selectedMonth, selectedYear]);

  return (
    <section
      className="
        relative w-full px-2 py-4 flex flex-col gap-4 items-center
        sm:p-4
        lg:p-6
        xl:w-[90%] xl:mx-auto
    "
    >
      <h2 className="self-start text-3xl text-[#464646] font-extrabold lg:hidden">
        Budget
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
            <span className="text-[#464646] font-semibold text-lg">Month</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              name="months"
              className="
              p-2 border border-slate-300 bg-white rounded text-slate-600 outline-none cursor-pointer 
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
            <span className="text-[#464646] font-semibold text-lg">Year</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              name="years"
              className="
              p-2 border border-slate-300 bg-white rounded text-slate-600 outline-none cursor-pointer
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
                flex-1 font-bold text-lg bg-[#767CFF] text-[#FFF7FF] rounded cursor-pointer hover:bg-[#8476ff]
                lg:self-start lg:px-8
          "
            >
              + Add
            </button>
          </div>
        </section>

        {isFormOpen && (
          <BudgetModal
            setIsFormOpen={setIsFormOpen}
            monthValues={monthValues}
            years={years}
          />
        )}

        {/* Total budget */}
        {budget.month ? (
          <section
            className="
          w-full p-3 bg-white rounded flex gap-2
          sm:p-4 sm:gap-0
          lg:order-1
      "
          >
            <div className="flex-1 flex flex-col gap-3 sm:justify-center sm:gap-4 sm:text-lg sm:p-3">
              <div className="flex flex-col gap-1 sm:flex-row">
                <p className="text-[#464646] font-semibold">Total Budget:</p>
                <span className="text-[#767CFF]">
                  {formatCurrencyVN(budget.totalBudget)} đ
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row">
                <p className="text-[#464646] font-semibold">Total Spent:</p>
                <span className="text-red-500">
                  {formatCurrencyVN(budget.totalSpent)} đ
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row">
                <p className="text-[#464646] font-semibold">Total Remain:</p>
                <span className="text-green-500">
                  {formatCurrencyVN(+budget.totalBudget - +budget.totalSpent)} đ
                </span>
              </div>
            </div>

            <div className="flex-1 self-center flex flex-col items-center gap-5">
              <MyBudgetCircle percentage={budget.totalPercentUsed} />
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="p-2 rounded-full bg-[#6C2BD9]"></div>
                  <span className="text-[#464646]">Spent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="p-2 rounded-full bg-[#e6e6fa]"></div>
                  <span className="text-[#464646]">Remain</span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="w-full h-32 p-3 flex justify-center items-center bg-white rounded text-[#464646] text-lg font-semibold">
            <h2>No data to display.</h2>
          </section>
        )}
      </div>

      {/* Budget by category */}
      <section
        className="
            w-full p-3 bg-white rounded flex flex-col gap-2
            sm:p-4
            lg:p-6
            xl:w-full
      "
      >
        <h2 className="text-[#464646] font-bold sm:text-lg ">Categories</h2>
        <hr className="text-[#464646] h-1 w-full my-1" />

        <BudgetByCategory categoryStats={budget.categoryStats} />
      </section>
    </section>
  );
};

export default BudgetPage;
