import React, { useEffect, useState } from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { FaWallet } from "react-icons/fa";
import { AiOutlineTransaction } from "react-icons/ai";
import { IoStatsChart } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { Link, useLocation } from "react-router";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoMdAnalytics } from "react-icons/io";
import { RxActivityLog } from "react-icons/rx";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { LuGoal } from "react-icons/lu";

const BigSideBar = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  const [navArr, setNavArr] = useState([]);

  useEffect(() => {
    if (user.role === "admin") {
      setNavArr([
        {
          icon: <MdSpaceDashboard />,
          label: t("dashboard"),
          path: "/admin/dashboard",
        },
        {
          icon: <AiOutlineTransaction />,
          label: t("transactions"),
          path: "/admin/transactions",
        },
        { icon: <BsFillPeopleFill />, label: t("users"), path: "/admin/users" },
        { icon: <RxActivityLog />, label: t("logs"), path: "/admin/logs" },
        { icon: <MdSettings />, label: t("setting"), path: "/settings" },
      ]);
    } else {
      setNavArr([
        {
          icon: <MdSpaceDashboard />,
          label: t("dashboard"),
          path: "/dashboard",
        },
        {
          icon: <AiOutlineTransaction />,
          label: t("transactions"),
          path: "/transactions",
        },
        { icon: <FaWallet />, label: t("budget"), path: "/budget" },
        { icon: <LuGoal />, label: t("financialGoal"), path: "/goals" },
        { icon: <IoStatsChart />, label: t("stat"), path: "/stat" },
        { icon: <MdSettings />, label: t("setting"), path: "/settings" },
      ]);
    }
  }, [user, i18n.language]);

  return (
    <div className="w-full h-screen p-6 flex flex-col gap-0 text-[#464646] font-bold dark:bg-[#2B2B2F] dark:text-white/87">
      {navArr.map((item, index) => {
        const isActive = location.pathname === item.path;
        const isAdmin = user.role === "admin";

        const activeGradient = isAdmin
          ? "bg-gradient-to-r from-sky-600 to-sky-300 text-white"
          : "bg-gradient-to-r from-[#5D43DB] to-[#A596E7] dark:from-[#6865C0] dark:to-[#6865C0] text-white dark:text-[#3E3D3D]";

        return (
          <div
            key={index}
            className={`group p-3 flex items-center gap-3 cursor-pointer rounded-lg 3xl:p-4 ${
              isActive ? activeGradient : "bg-transparent"
            }`}
          >
            <span className="text-3xl transform transition group-hover:scale-110 3xl:text-4xl">
              {item.icon}
            </span>
            <Link
              to={item.path}
              className="transform transition group-hover:scale-105 3xl:text-xl"
            >
              {item.label}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default BigSideBar;
