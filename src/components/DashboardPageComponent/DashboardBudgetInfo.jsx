import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBudget } from "../../features/budgetSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import { useNavigate } from "react-router";
import ShortBudgetLoading from "../Loading/DashboardLoading/ShortBudgetLoading";
import { useTranslation } from "react-i18next";

const DashboardBudgetInfo = ({ className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  // const budget = useSelector((state) => state.budget);
  // --- BẮT ĐẦU SỬA LỖI ---
  const {
    totalBudget,
    totalSpent,
    totalPercentUsed,
    currency, // Đây là 'originalCurrency' từ slice của bạn
    originalAmount, // Thêm trường này
    loading,
    error,
  } = useSelector((state) => state.budget);

  // Xóa dòng này, chúng ta sẽ tính lại
  // const remain = totalBudget - totalSpent;
  // --- KẾT THÚC SỬA LỖI ---

  useEffect(() => {
    const now = new Date();
    dispatch(getBudget({ month: now.getMonth() + 1, year: now.getFullYear() }));
  }, [dispatch]); // Thêm 'dispatch' vào dependency array

  if (loading) return <ShortBudgetLoading className={className} />;

  // --- THÊM MỚI: Logic tính toán hiển thị ---
  const BASE_CURRENCY = "VND";

  let displayBudget = 0;
  let displaySpent = 0;
  let displayRemaining = 0;
  // 'currency' từ slice (là originalCurrency) là tiền tệ chúng ta muốn hiển thị
  let displayCurrency = currency || BASE_CURRENCY;

  if (displayCurrency === BASE_CURRENCY || !currency) {
    // TRƯỜNG HỢP 1: Ngân sách là VND
    displayBudget = totalBudget;
    displaySpent = totalSpent;
  } else {
    // TRƯỜNG HỢP 2: Ngân sách là ngoại tệ (USD, EUR...)
    displayBudget = originalAmount; // Hiển thị số tiền gốc (ví dụ: 100)

    // Tính tỷ giá (VND / Gốc)
    let exchangeRate = 1;
    if (originalAmount !== 0) {
      exchangeRate = totalBudget / originalAmount;
    }
    if (exchangeRate === 0) exchangeRate = 1; // Tránh chia cho 0

    // Quy đổi spent (VND) về (Gốc)
    displaySpent = totalSpent / exchangeRate;
  }

  // Tính 'còn lại' dựa trên các giá trị *hiển thị*
  displayRemaining = displayBudget - displaySpent;
  // --- KẾT THÚC THÊM MỚI ---

  return (
    <div
      className={`w-full bg-white rounded-lg p-4 shadow ${className} 3xl:p-6 dark:bg-[#2E2E33] dark:text-white/90 dark:border-slate-700 dark:border`}
    >
      <div className="h-full flex flex-col gap-2 lg:gap-3 xl:gap-2">
        <h2
          onClick={() => navigate("/budget")}
          className="
            w-fit text-lg font-bold hover:scale-105 transition-all cursor-pointer lg:text-xl 3xl:text-2xl
        "
        >
          {t("budget")}
        </h2>

        <div className="h-full flex flex-col justify-around md:w-[80%] md:mx-auto lg:w-[75%] xl:w-full">
          {/* Tổng ngân sách */}
          <div className="text-base font-bold text-gray-600 text-end md:text-lg 3xl:text-xl dark:text-white/80">
            {formatCurrency(displayBudget, currency, i18n.language)}
          </div>

          {/* Phần trăm + thanh tiến trình */}
          <div className="flex items-center gap-3 lg:gap-5">
            {/* Tỷ lệ phần trăm */}
            <span className="text-[14px] font-semibold text-gray-500 w-[35px] text-center md:text-base xl:text-[14px] 3xl:text-lg dark:text-white/80">
              {totalPercentUsed}%
            </span>

            {/* Thanh tiến trình */}
            <div className="relative w-30 flex-1 h-2 bg-purple-100 rounded-full md:h-3 xl:h-2 3xl:h-3.5">
              <div
                className="absolute top-0 left-0 h-2 bg-[#767CFF] rounded-full transition-all duration-300 md:h-3 xl:h-2 3xl:h-3.5"
                style={{ width: `${totalPercentUsed}%` }}
              />
            </div>
          </div>

          {/* Spent / Remain (mini legend) */}
          <div
            className="
            flex flex-col gap-3 text-[12px] text-gray-500 mt-2 px-2 dark:text-white/80
            md:px-0 md:flex-row md:justify-center md:gap-5 md:text-[14px]
            lg:text-base lg:gap-6
            xl:text-[14px] xl:gap-3
            3xl:gap-6 3xl:text-base
          "
          >
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 bg-[#767CFF] rounded-full" />
              <span className="flex gap-3">
                {t("spent")}:{" "}
                {formatCurrency(displaySpent, currency, i18n.language)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 bg-purple-200 rounded-full" />
              <span>
                {t("remaining")}:{" "}
                {formatCurrency(displayRemaining, currency, i18n.language)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBudgetInfo;
