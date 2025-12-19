import React, { useEffect, useRef } from "react";
import { AiFillHome } from "react-icons/ai";
import { MdSettings, MdCategory } from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa";
import { RiDashboardFill } from "react-icons/ri";
import { GiReceiveMoney } from "react-icons/gi";
import { Link } from "react-router-dom";
import { IoMdCloseCircle } from "react-icons/io";
import { IoStatsChart } from "react-icons/io5";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import { LuGoal } from "react-icons/lu";

function SidebarComponent({ setToggleSidebar }) {
  const { t, i18n } = useTranslation();

  const sidebarRef = useRef();

  const navArr = [
    { icon: <RiDashboardFill />, label: t("dashboard"), path: "/dashboard" },
    {
      icon: <FaMoneyBillWave />,
      label: t("transactions"),
      path: "/transactions",
    },
    { icon: <GiReceiveMoney />, label: t("budget"), path: "/budget" },
    { icon: <LuGoal />, label: t("financialGoal"), path: "/goals" },
    { icon: <IoStatsChart />, label: t("stat"), path: "/stat" },
    { icon: <MdSettings />, label: t("setting"), path: "/settings" },
  ];

  useEffect(() => {
    gsap.fromTo(
      sidebarRef.current,
      { x: "100%" },
      { x: "0%", duration: 0.5, ease: "power2.out" }
    );

    gsap.to(sidebarRef.current, {
      backgroundPosition: "400% 0%",
      duration: 20,
      ease: "linear",
      repeat: -1,
      yoyo: true,
    });
  }, []);

  useEffect(() => {
    gsap.fromTo(
      sidebarRef.current,
      { x: "100%" },
      { x: "0%", duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const handleCloseSidebar = () => {
    gsap.to(sidebarRef.current, {
      x: "100%",
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        setToggleSidebar(false);
      },
    });
  };

  return (
    <div
      ref={sidebarRef}
      className="
    fixed top-0 right-0 z-100 w-full h-screen text-white px-6 py-4 flex flex-col 
    sm:w-[30%] sm:px-0
    bg-[linear-gradient(90deg,_#363B9D,_#5f6ee6,_#8e9bff,_#5f6ee6,_#363B9D)]
    bg-[length:400%_100%]
    animate-none
    lg:hidden
  "
    >
      {/* Nút Đóng */}
      <div
        onClick={() => handleCloseSidebar()}
        className="
        w-fit my-5 self-center p-1 flex justify-center
      "
      >
        <IoMdCloseCircle
          className="
        cursor-pointer hover:text-red-300 text-4xl text-white transition-colors duration-200
          
      "
        />
      </div>

      {/* Mục Menu SideBar */}
      <ul className="w-full mx-auto sm:mx-0 my-5 flex flex-col gap-5 font-bold">
        {navArr.map((item, index) => (
          <li
            key={index}
            className="
              group flex items-center gap-3 cursor-pointer text-[clamp(14px,2vw,20px)] transition duration-200 hover:bg-white/10 rounded-md px-3 py-2 
            "
          >
            <span
              className="
              text-3xl sm:text-3xl transform transition group-hover:scale-110
            "
            >
              {item.icon}
            </span>
            <Link
              onClick={() => handleCloseSidebar()}
              to={item.path}
              className="
                transform transition group-hover:scale-105
              "
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SidebarComponent;
