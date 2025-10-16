import React, { useEffect, useState } from "react";
import LineChart from "../Chart/LineChart";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router";
import OverviewLoading from "../Loading/DashboardLoading/OverviewLoading";
import { useTranslation } from "react-i18next";

const DashboardOverview = ({ className = "" }) => {
  const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;
  const token = useSelector((state) => state.auth.token);
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState([]);

  const getMonthLabels = () => {
    const now = new Date();
    const currentMonth = now.getMonth() - 1;
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames.slice(0, currentMonth + 2);
  };

  useEffect(() => {
    const now = new Date();
    const months = Array.from({ length: now.getMonth() + 1 }, (_, i) => i + 1);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACK_END_URL}/api/dashboard/by-months`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIncomeData((prev) => (prev = res.data.map((item) => item.income)));
        setExpenseData((prev) => (prev = res.data.map((item) => item.expense)));

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }

      // for (const month of months) {
      //   try {
      //     setLoading(true);
      //     const res = await axios.get(
      //       `${BACK_END_URL}/api/dashboard?month=${month}&year=${now.getFullYear()}`,
      //       {
      //         headers: {
      //           Authorization: `Bearer ${token}`,
      //         },
      //       }
      //     );

      //     const { totalIncome = 0, totalExpense = 0 } = res.data || {};
      //     incomeArr.push(totalIncome);
      //     expenseArr.push(totalExpense);

      //     setLoading(false);
      //   } catch (error) {
      //     setLoading(false);
      //     incomeArr.push(0);
      //     expenseArr.push(0);
      //   }
      // }
      // setIncomeData(incomeArr);
      // setExpenseData(expenseArr);

      setLabels(getMonthLabels());
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (incomeData.length === 0 && expenseData.length === 0 && token) {
    return <OverviewLoading className={className} />;
  }

  if (!loading && incomeData.length === 0 && expenseData.length === 0)
    return (
      <div className="w-full h-full p-5 flex justify-center items-center font-semibold 3xl:text-xl dark:bg-[#2E2E33] dark:text-white/90">
        {t("noData")}
      </div>
    );

  return (
    <div
      className={`
        w-full h-full ${className} flex flex-col mb-3 bg-white rounded-lg border border-slate-200 shadow p-4 dark:bg-[#2E2E33] dark:text-white/90 dark:border-slate-700
        lg:my-0 lg:mb-1
        3xl:p-6
      `}
    >
      <h2
        onClick={() => navigate("/stat")}
        className="
          w-fit mb-2 text-xl font-bold hover:scale-105 transition-all cursor-pointer 3xl:text-2xl
      "
      >
        {t("overview")}
      </h2>

      <div className="w-full h-full p-4 flex justify-center items-center sm:p-0">
        <div className="h-full w-full sm:w-[70%] lg:h-[90%] lg:p-0">
          <LineChart
            labels={labels}
            dataIncome={incomeData}
            dataExpense={expenseData}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
