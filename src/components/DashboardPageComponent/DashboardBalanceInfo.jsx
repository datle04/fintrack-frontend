import React, { useEffect } from "react";
import { TfiWallet } from "react-icons/tfi";
import { FaLongArrowAltUp } from "react-icons/fa";
import { FaLongArrowAltDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getDashboard } from "../../features/dashboardSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import BalanceInfoLoading from "../Loading/DashboardLoading/BalanceInfoLoading";
import { useTranslation } from "react-i18next";
import HoverCard from "../GSAP/HoverCard";
import CountUpNumber from "../GSAP/CountUpNumber";

const DashboardBalanceInfo = ({ className = "" }) => {
  const { totalIncome, totalExpense, balance, currency, loading, error } =
    useSelector((state) => state.dashboard);

  const userCurrency = useSelector((state) => state.auth.user.currency);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const today = new Date();

  // 🗓️ Lấy ngày đầu tháng
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  // 🗓️ Lấy ngày cuối tháng
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  useEffect(() => {
    const date = new Date();
    dispatch(
      getDashboard({
        start: firstDay.toISOString().split("T")[0],
        end: lastDay.toISOString().split("T")[0],
        currency: userCurrency,
      })
    );
  }, []);

  if (loading) return <BalanceInfoLoading className={className} />;

  return (
    <section
      className={`
        w-full ${className} grid grid-cols-2 grid-rows-2 gap-2
        md:grid-cols-3 md:grid-rows-1 md:gap-3
    `}
    >
      {/* --- Balance Box --- */}
      <HoverCard className="col-span-2 md:col-span-1 md:col-start-3">
        <div
          className="
            h-full w-full p-3 flex items-center justify-center gap-5 
            bg-[#767CFF] text-white rounded-lg border border-slate-200 shadow 
            dark:bg-[#4a4e94] dark:border-slate-700
          "
        >
          <TfiWallet className="text-[40px] md:text-4xl 3xl:text-5xl" />
          <div className="flex flex-col font-semibold text-base 3xl:text-xl">
            <span>{t("balance")}</span>
            <CountUpNumber
              value={balance}
              currency={currency}
              locale={i18n.language}
            />
          </div>
        </div>
      </HoverCard>

      {/* --- Gross Income --- */}
      <HoverCard className="md:col-start-1 md:row-start-1">
        <div
          className="
            h-full w-full p-3 flex items-center justify-center gap-2 
            bg-white rounded-lg border border-slate-200 
            dark:bg-[#2E2E33] dark:border-slate-700
          "
        >
          <FaLongArrowAltUp className="text-3xl text-green-500 md:text-4xl 3xl:text-5xl dark:text-green-700" />
          <div className="flex flex-col font-semibold text-sm md:text-base 3xl:text-lg">
            <span>{t("totalIncome")}</span>
            <CountUpNumber
              value={totalIncome}
              currency={currency}
              locale={i18n.language}
            />
          </div>
        </div>
      </HoverCard>

      {/* --- Total Expense --- */}
      <HoverCard className="md:col-start-2 md:row-start-1">
        <div
          className="
            h-full w-full p-3 flex items-center justify-center gap-2 
            bg-white rounded-lg border border-slate-200 
            dark:bg-[#2E2E33] dark:border-slate-700
          "
        >
          <FaLongArrowAltDown className="text-3xl text-red-500 3xl:text-5xl dark:text-red-700" />
          <div className="flex flex-col font-semibold text-sm md:text-base 3xl:text-lg">
            <span>{t("totalExpense")}</span>
            <CountUpNumber
              value={totalExpense}
              currency={currency}
              locale={i18n.language}
            />
          </div>
        </div>
      </HoverCard>
    </section>
  );
};

export default DashboardBalanceInfo;
