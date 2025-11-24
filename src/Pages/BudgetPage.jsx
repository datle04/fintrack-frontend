import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteBudget, getBudget } from "../features/budgetSlice";
import { formatCurrency, getDisplaySpentValue } from "../utils/formatCurrency";
import MyBudgetCircle from "../components/BudgetPageComponent/MyBudgetCircle";
import BudgetByCategory from "../components/BudgetPageComponent/BudgetByCategory";
import BudgetModal from "../components/BudgetPageComponent/BudgetModal";
import BudgetPageLoading from "../components/Loading/BudgetLoading/BudgetPageLoading";
import { useTranslation } from "react-i18next";
import { getCurrencySymbol } from "../utils/currencies";
import toast from "react-hot-toast";
import { useBudgetCalculations } from "../hooks/useBudgetCalculations";
import { categoryList } from "../utils/categoryList";
import { Plus, Trash2, Calendar, Edit } from "lucide-react";
import { TfiWallet } from "react-icons/tfi";

const BudgetPage = () => {
  const now = new Date();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const budget = useSelector((state) => state.budget);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const hasBudget =
    budget.month === Number(selectedMonth) &&
    budget.year === Number(selectedYear) &&
    (budget.totalBudget > 0 || budget.originalAmount > 0);

  const fetchBudget = useCallback(() => {
    dispatch(getBudget({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleDelete = async () => {
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa toàn bộ ngân sách tháng này?")
    )
      return;

    toast.promise(
      dispatch(
        deleteBudget({ month: selectedMonth, year: selectedYear })
      ).unwrap(),
      {
        loading: "Đang xóa...",
        success: <b>Xóa thành công!</b>,
        error: "Gặp lỗi khi xóa",
      }
    );
  };
  // 🔥 THAY THẾ TOÀN BỘ KHỐI TÍNH TOÁN CŨ BẰNG 1 DÒNG NÀY:
  const {
    displayBudget,
    displaySpent,
    displayRemaining,
    displayCurrency,
    percentUsed,
    categoryStats, // Dùng cái này truyền xuống BudgetByCategory
  } = useBudgetCalculations(budget);

  const monthValues = Array.from({ length: 12 }, (_, i) => ({
    title: i + 1,
    value: i + 1,
  }));
  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  if (budget.loading) return <BudgetPageLoading />;

  return (
    <section className="w-full min-h-screen bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-6 xl:p-8">
      {/* --- 1. TOOLBAR (Header) --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {t("budget")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý chi tiêu tháng {selectedMonth}/{selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-[#2E2E33] p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Chọn Tháng */}
          <div className="flex items-center px-2 border-r border-gray-200 dark:border-gray-600">
            <Calendar className="text-gray-400 mr-2" size={16} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent outline-none text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              {monthValues.map((m) => (
                <option key={m.value} value={m.value}>
                  Tháng {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Năm */}
          <div className="px-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent outline-none text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Nút Add / Edit */}
          <button
            onClick={() => setIsFormOpen(true)}
            className={`
    p-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 text-white
    ${
      hasBudget
        ? "bg-orange-500 hover:bg-orange-600" // Màu cam cho Edit
        : "bg-indigo-600 hover:bg-indigo-700" // Màu tím cho Add
    }
  `}
            title={hasBudget ? t("edit_budget") : t("add_budget")} // Tooltip
          >
            {/* Đổi Icon dựa trên trạng thái */}
            {hasBudget ? <Edit size={18} /> : <Plus size={18} />}

            {/* (Tùy chọn) Nếu bạn muốn hiện chữ bên cạnh icon */}
            <span className="hidden md:inline font-medium text-sm">
              {hasBudget ? t("edit") : t("add")}
            </span>
          </button>

          {/* Nút Delete (Chỉ hiện khi đã có Budget) */}
          {hasBudget && (
            <button
              onClick={handleDelete}
              className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-lg transition-colors"
              title={t("delete_budget")}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* --- 2. SUMMARY CARD (Thẻ Tổng quan Hiện đại) --- */}
      {budget.month ? (
        <div
          className="
            relative overflow-hidden 
            bg-gradient-to-br from-violet-600 to-indigo-600 
            rounded-3xl p-6 md:p-8 
            text-white shadow-xl shadow-indigo-200 dark:shadow-none
            mb-8 
            flex flex-col md:flex-row items-center justify-between gap-8
          "
        >
          {/* 1. HỌA TIẾT TRANG TRÍ NỀN (Background Decor) */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-purple-400 opacity-20 rounded-full blur-2xl pointer-events-none"></div>

          {/* 2. THÔNG TIN CHÍNH (Left Side) */}
          <div className="flex-1 z-10 w-full">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <TfiWallet size={18} />
              </span>
              <p className="text-sm font-medium tracking-wide uppercase">
                {t("availableBudget")}
              </p>
            </div>

            {/* Số tiền to và đậm hơn */}
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
              {formatCurrency(displayRemaining, displayCurrency, i18n.language)}
            </h2>

            {/* 3. CÁC HỘP THÔNG TIN PHỤ (Glassmorphism Boxes) */}
            <div className="flex gap-4">
              {/* Box 1: Đã đặt */}
              <div className="flex-1 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <p className="text-indigo-100 text-xs mb-1 opacity-80">
                  {t("totalBudget")}
                </p>
                <p className="font-bold text-lg md:text-xl">
                  {formatCurrency(
                    displayBudget,
                    displayCurrency,
                    i18n.language
                  )}
                </p>
              </div>

              {/* Box 2: Đã chi */}
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <p className="text-indigo-100 text-xs mb-1 opacity-80">
                  {t("spent")}
                </p>
                <p className="font-bold text-lg md:text-xl text-red-200">
                  {formatCurrency(displaySpent, displayCurrency, i18n.language)}
                </p>
              </div>
            </div>
          </div>

          {/* 4. BIỂU ĐỒ (Right Side) */}
          <div className="z-10 relative">
            {/* Thêm vòng tròn mờ phía sau biểu đồ để làm nổi bật */}
            <div className="absolute inset-0 bg-white/5 rounded-full blur-md transform scale-90"></div>
            <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
              <MyBudgetCircle percentage={percentUsed} />
            </div>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="bg-white dark:bg-[#2E2E33] p-8 rounded-2xl border border-dashed border-gray-300 text-center mb-8">
          <p className="text-gray-500">Chưa có ngân sách cho tháng này.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-3 text-indigo-600 font-medium hover:underline"
          >
            Tạo ngay
          </button>
        </div>
      )}

      {/* --- 3. DANH SÁCH CHI TIẾT (Grid Layout) --- */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Chi tiết theo Danh mục
        </h2>
        <BudgetByCategory
          categoryList={categoryList}
          categoryStats={categoryStats} // Dữ liệu sạch từ Hook
          currency={displayCurrency}
        />
      </div>

      {/* Modal */}
      {isFormOpen && (
        <BudgetModal
          categoryList={categoryList}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          monthValues={monthValues}
          years={years}
          setIsFormOpen={setIsFormOpen}
          currentBudget={budget} // Truyền budget hiện tại xuống để fill form
          onClose={() => fetchBudget()} // Reload sau khi đóng
        />
      )}
    </section>
  );
};

export default BudgetPage;
