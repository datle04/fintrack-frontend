import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactions } from "../../features/transactionSlice";
import { getDashboard } from "../../features/dashboardSlice";
import formatDateToString from "../../utils/formatDateToString";
import formatCurrencyVN from "../../utils/formatCurrency";
import { useNavigate } from "react-router";
import RecentTransactionsLoading from "../Loading/DashboardLoading/RecentTransactionsLoading";
import { useTranslation } from "react-i18next";

const DashboardRecentTransactions = ({ className = "" }) => {
  const transactions = useSelector((state) => state.transaction.transactions);
  const loading = useSelector((state) => state.transaction.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const today = new Date();
  // 🗓️ Lấy ngày đầu tháng
  const firstDay = new Date(today.getFullYear(), 1, 1);
  // 🗓️ Lấy ngày cuối tháng
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  useEffect(() => {
    dispatch(
      getTransactions({
        type: "",
        category: "",
        keyword: "",
        startDate: firstDay.toISOString().split("T")[0],
        endDate: lastDay.toISOString().split("T")[0],
      })
    );
  }, []);

  if (loading) return <RecentTransactionsLoading className={className} />;

  return (
    <div
      className={`
            w-full ${className} p-4 bg-white rounded-lg border border-slate-200 shadow dark:bg-[#2E2E33] dark:text-white/90 dark:border-slate-700
            md:p-5
            lg:mt-0
    `}
    >
      <div
        className="
                flex justify-between items-center
            "
      >
        <h2
          onClick={() => navigate("/transactions")}
          className="
                text-xl font-semibold hover:scale-105 transition-all cursor-pointer
            "
        >
          {t("recentTransactions")}
        </h2>
        <span
          onClick={() => navigate("/transactions")}
          className="
                text-slate-500 underline text-sm cursor-pointer hover:text-slate-600
                md:text-base
            "
        >
          {t("seeAll")}
        </span>
      </div>

      <hr className="w-full my-1 h-[1.5px] bg-[#A0A0A0] border-none 2xl:mb-2 dark:bg-slate-700" />

      <div className="relative max-h-[85%] overflow-hidden">
        <div className="flex flex-col gap-3 md:gap-4">
          {transactions.map((item, index) => (
            <div
              key={item._id}
              className="grid grid-cols-3 justify-between items-start text-sm md:px-5 3xl:text-base"
            >
              <span className="text-ellipsis line-clamp-1">
                {t(`categories.${item.category}`)}
              </span>
              <span>{formatDateToString(item.date)}</span>
              <span
                className={`${
                  item.type === "expense"
                    ? "text-[#FB2C36] dark:text-[#d45158]"
                    : "text-[#00C951] dark:text-[#3b995a]"
                }`}
              >
                {item.type === "expense" ? "-" : "+"}
                {formatCurrencyVN(item.amount)}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute z-0 bottom-0 left-0 w-full h-15 bg-gradient-to-t from-white to-transparent dark:from-[#2E2E33]" />
      </div>
    </div>
  );
};

export default DashboardRecentTransactions;
