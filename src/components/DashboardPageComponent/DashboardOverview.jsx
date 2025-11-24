import React, { useEffect, useState } from "react";
import LineChart from "../Chart/LineChart";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router";
import OverviewLoading from "../Loading/DashboardLoading/OverviewLoading";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../api/axiosInstance";

const DashboardOverview = ({ className = "" }) => {
  const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;
  const user = useSelector((state) => state.auth);
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
      console.log("Called!");

      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/dashboard/by-months`);
        console.log(res.data);
        setIncomeData((prev) => (prev = res.data.map((item) => item.income)));
        setExpenseData((prev) => (prev = res.data.map((item) => item.expense)));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }

      setLabels(getMonthLabels());
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (incomeData.length === 0 && expenseData.length === 0 && user) {
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
        lg:my-0 lg:mb-2
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

      <div className="w-full h-full max-h-[200px] p-4 flex justify-center items-center sm:p-0">
        <div className="h-full w-full sm:w-[70%] lg:h-full lg:p-0">
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
