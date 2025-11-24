import React, { useEffect, useRef, useState } from "react";
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
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BigSideBar = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  const [navArr, setNavArr] = useState([]);

  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    // ... (Logic setNavArr giữ nguyên như cũ) ...
    if (user?.role === "admin") {
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
        { icon: <FaWallet />, label: t("budget"), path: "/admin/budgets" },
        { icon: <LuGoal />, label: t("financialGoal"), path: "/admin/goals" },
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

  useGSAP(() => {
    // Hàm thực hiện animation
    const updatePillPosition = () => {
      if (navArr.length === 0) return;

      const activeIndex = navArr.findIndex(
        (item) => item.path === location.pathname
      );
      const activeElement = itemsRef.current[activeIndex];

      if (activeElement && pillRef.current) {
        gsap.to(pillRef.current, {
          y: activeElement.offsetTop,
          height: activeElement.offsetHeight,
          opacity: 1,
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    };

    // A. Chạy ngay lập tức
    updatePillPosition();

    // B. Chạy lại sau 1 khoảng nhỏ (để chờ font/layout render xong)
    const timer = setTimeout(updatePillPosition, 100);

    // C. Lắng nghe sự kiện resize cửa sổ (để fix khi user co kéo trình duyệt)
    const onResize = () => updatePillPosition();
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [location.pathname, navArr]);

  const isAdmin = user?.role === "admin";
  const pillGradient = isAdmin
    ? "bg-gradient-to-r from-sky-600 to-sky-300"
    : "bg-gradient-to-r from-[#5D43DB] to-[#A596E7] dark:from-[#6865C0] dark:to-[#6865C0]";

  return (
    // Thêm containerRef và relative để định vị viên thuốc
    <div
      ref={containerRef}
      className="w-full h-screen p-6 flex flex-col gap-2 text-[#464646] font-bold dark:bg-[#2B2B2F] dark:text-white/87 relative"
    >
      {/* 4. Viên thuốc (Pill) - Absolute */}
      <div
        ref={pillRef}
        className={`absolute top-0 left-6 right-6 rounded-lg z-0 opacity-0 pointer-events-none ${pillGradient}`}
        style={{ height: 0 }} // Chiều cao ban đầu là 0
      />

      {navArr.map((item, index) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={index}
            to={item.path}
            // 5. Gán ref cho từng item vào mảng itemsRef
            ref={(el) => (itemsRef.current[index] = el)}
            className={`
              relative z-10 flex items-center gap-3 p-3 rounded-lg 3xl:p-4 cursor-pointer transition-colors duration-200
              ${
                isActive
                  ? "text-white dark:text-[#3E3D3D]"
                  : "hover:bg-gray-100 dark:hover:bg-white/10"
              }
            `}
          >
            <span className="text-3xl transform transition hover:scale-110 3xl:text-4xl">
              {item.icon}
            </span>
            <span className="transform transition hover:scale-105 3xl:text-xl">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BigSideBar;
