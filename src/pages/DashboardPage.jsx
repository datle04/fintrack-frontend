import React, { useEffect } from "react";
import Header from "../components/Header";
import DashboardBalanceInfo from "../components/DashboardPageComponent/DashboardBalanceInfo";
import DashboardRecentTransactions from "../components/DashboardPageComponent/DashboardRecentTransactions";
import DashboardBudgetInfo from "../components/DashboardPageComponent/DashboardBudgetInfo";
import DashboardStat from "../components/DashboardPageComponent/DashboardStat";
import DashboardOverview from "../components/DashboardPageComponent/DashboardOverview";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import HoverCard from "../components/GSAP/HoverCard";

const DashboardPage = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (user.role === "admin") navigate("/admin/dashboard");
  }, [user]);
  return (
    <div className="w-full h-full">
      <section
        className="
          w-full h-[85vh] p-1 bg-[#F5F6FA] text-[#464646] dark:bg-[#35363A] dark:text-white/90
          flex flex-col gap-3 sm:p-3 md:px-8 md:py-3
          lg:h-full
          xl:grid xl:grid-cols-3 xl:grid-rows-7 xl:gap-3 xl:auto-rows-auto xl:items-stretch xl:h-full
          3xl:gap-5
        "
      >
        {/* Balance Info */}
        <DashboardBalanceInfo className="w-full h-full col-start-1 col-span-3 row-start-1 row-span-1" />

        {/* Recent Transactions */}
        <HoverCard className="col-start-3 col-span-1 row-start-4 row-span-4">
          <DashboardRecentTransactions className="w-full h-full" />
        </HoverCard>

        {/* Budget Info */}
        <HoverCard className="col-start-3 col-span-1 row-start-2 row-span-2">
          <DashboardBudgetInfo className="w-full h-full" />
        </HoverCard>

        {/* Statistics */}
        <HoverCard className="col-start-1 col-span-2 row-start-2 row-span-3">
          <DashboardStat className="w-full h-full" />
        </HoverCard>

        {/* Overview */}
        <HoverCard className="col-start-1 col-span-2 row-start-5 row-span-3">
          <DashboardOverview className="w-full h-full" />
        </HoverCard>
      </section>
    </div>
  );
};

export default DashboardPage;
