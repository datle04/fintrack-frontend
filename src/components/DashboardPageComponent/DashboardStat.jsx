import React, { useEffect } from "react";
import PieChart from "../Chart/PieChart";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import StatLoading from "../Loading/DashboardLoading/StatLoading";
import { getExpenseStat } from "../../features/statSlice";
import { useTranslation } from "react-i18next";

const DashboardStat = ({ className = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const stats = useSelector((state) => state.stat.stats);
  const loading = useSelector((state) => state.stat.loading);

  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    if (stats.length === 0 && !loading) {
      dispatch(
        getExpenseStat({
          type: "expense",
          startDate: startOfMonth.toISOString().split("T")[0],
          endDate: endOfMonth.toISOString().split("T")[0],
        })
      );
    }
  }, [dispatch]);

  if (loading) return <StatLoading className={className} />;

  return (
    <div
      className={`
        w-full ${className} flex flex-col bg-white rounded-lg border border-slate-200 shadow p-4 dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/90
        lg:mb-1 lg:my-0
        3xl:p-6
        `}
    >
      <h2
        onClick={() => navigate("/stat")}
        className="
            w-fit mb-2 text-xl font-bold hover:scale-105 transition-all cursor-pointer
            sm:mb-0
            3xl:text-2xl
          "
      >
        {t("stat")}
      </h2>

      <div className="h-full w-full p-5 flex justify-center items-center sm:p-0">
        <div className="w-full h-full sm:w-[80%] lg:w-[80%] lg:p-3 xl:w-[80%] 3xl:w-[70%]">
          <PieChart stats={stats} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default DashboardStat;
