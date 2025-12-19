import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import PieChartLoading from "./PieChartLoading";
import "react-loading-skeleton/dist/skeleton.css";

const StatLoading = ({ className = "" }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const checkDark = () => {
      setIsDarkMode(html.classList.contains("dark"));
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const baseColor = isDarkMode ? "#3A3B3C" : "#e0e0e0";
  const highlightColor = isDarkMode ? "#4A4B4D" : "#f5f5f5";

  return (
    <div
      className={`${className} flex flex-col bg-white rounded-lg border border-slate-200 shadow p-4 3xl:p-6 dark:bg-[#2E2E33] dark:border dark:border-slate-700`}
    >
      <div className="mb-4 dark:bg-[#2E2E33]">
        <Skeleton
          width={100}
          height={24}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>

      <PieChartLoading
        className={className}
        baseColor={baseColor}
        highlightColor={highlightColor}
      />
    </div>
  );
};

export default StatLoading;
