import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactions } from "../../features/transactionSlice";
import formatDateToString from "../../utils/formatDateToString";
import { formatCurrency } from "../../utils/formatCurrency";
import { useNavigate } from "react-router";
import RecentTransactionsLoading from "../Loading/DashboardLoading/RecentTransactionsLoading";
import { useTranslation } from "react-i18next";
// Import component Empty State vừa tạo (nếu để file riêng)
// import EmptyTransactionState from "./EmptyTransactionState";

// Nếu bạn để chung file thì dùng code EmptyTransactionState ở trên
const EmptyTransactionState = ({ t, onAddClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 h-full min-h-[180px] text-center animate-fade-in">
      <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-full mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-slate-400 dark:text-slate-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium">
        {t("noTransactionsYet") || "Chưa có giao dịch nào"}
      </p>
      <button
        onClick={onAddClick}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {t("addNew") || "+ Thêm mới"}
      </button>
    </div>
  );
};

const DashboardRecentTransactions = ({ className = "" }) => {
  const transactions = useSelector((state) => state.transaction.transactions);
  const loading = useSelector((state) => state.transaction.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const today = new Date();
  // ⚠️ FIX: getMonth() trả về 0-11, nên dùng today.getMonth() để lấy tháng hiện tại
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
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
  }, [dispatch]); // Thêm dispatch vào deps để chuẩn React Hooks

  if (loading) return <RecentTransactionsLoading className={className} />;

  return (
    <div
      className={`
            w-full ${className} p-4 bg-white rounded-lg border border-slate-200 shadow dark:bg-[#2E2E33] dark:text-white/90 dark:border-slate-700
            md:p-5 lg:mt-0 flex flex-col h-full
    `}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-1">
        <h2
          onClick={() => navigate("/transactions")}
          className="text-xl font-semibold hover:scale-105 transition-all cursor-pointer"
        >
          {t("recentTransactions")}
        </h2>
        <span
          onClick={() => navigate("/transactions")}
          className="text-slate-500 underline text-sm cursor-pointer hover:text-slate-600 md:text-base dark:text-slate-400 dark:hover:text-slate-300"
        >
          {t("seeAll")}
        </span>
      </div>

      <hr className="w-full my-1 h-[1.5px] bg-[#A0A0A0] border-none 2xl:mb-2 dark:bg-slate-700" />

      {/* CONTENT BODY */}
      <div className="flex-1 relative min-h-[200px]">
        {transactions && transactions.length > 0 ? (
          <div className="relative max-h-full overflow-hidden">
            <div className="flex flex-col gap-3 md:gap-4 mt-2">
              {transactions.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-3 justify-between items-start text-sm md:px-5 3xl:text-base hover:bg-slate-50 dark:hover:bg-white/5 p-1 rounded transition-colors cursor-default"
                >
                  <span className="text-ellipsis line-clamp-1 font-medium text-slate-700 dark:text-slate-200">
                    {t(`categories.${item.category}`)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatDateToString(item.date)}
                  </span>
                  <span
                    className={`text-right text-ellipsis line-clamp-1 font-semibold ${
                      item.type === "expense"
                        ? "text-[#FB2C36] dark:text-[#ff5c63]"
                        : "text-[#00C951] dark:text-[#4ade80]"
                    } `}
                  >
                    {item.type === "expense" ? "-" : "+"}
                    {formatCurrency(item.amount, item.currency, i18n.language)}
                  </span>
                </div>
              ))}
            </div>
            {/* Fade effect ở bottom */}
            <div className="absolute z-10 bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#2E2E33] dark:via-[#2E2E33]/80" />
          </div>
        ) : (
          /* HIỂN THỊ EMPTY STATE KHI KHÔNG CÓ DỮ LIỆU */
          <EmptyTransactionState
            t={t}
            onAddClick={() => navigate("/transactions/add")} // Hoặc route thêm giao dịch của bạn
          />
        )}
      </div>
    </div>
  );
};

export default DashboardRecentTransactions;
