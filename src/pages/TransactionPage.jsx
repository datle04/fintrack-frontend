import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async"; // SEO
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// Icons
import {
  Search,
  Plus,
  Calendar,
  ArrowRight,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

// Components & Utils
import {
  getTransactions,
  deleteTransaction,
  setShouldRefetch,
} from "../features/transactionSlice";
import { getDashboard } from "../features/dashboardSlice";
import TransactionModal from "../components/TransactionModal";
import DetailTransaction from "../components/DetailTransaction";
import ConfirmModal from "../components/ConfirmModal";
import FilterSelect from "../components/TransactionPageComponent/FilterSelect"; // Component tách riêng (xem bên dưới)
import Shimmer from "../components/Loading/Shimmer";
import { formatCurrency } from "../utils/formatCurrency";
import formatDateToString from "../utils/formatDateToString";
import { groupTransactionsByDate } from "../utils/groupTransactions"; // Helper tách riêng (xem bên dưới)
import { categoryList } from "../utils/categoryList";

const TransactionPage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  // Redux State
  const { transactions, loading, total, page, totalPages, shouldRefetch } =
    useSelector((s) => s.transaction);
  const userCurrency = useSelector((state) => state.auth.user.currency);
  const { totalIncome, totalExpense } = useSelector((state) => state.dashboard);

  // --- 1. CONFIG & CONSTANTS ---
  const today = new Date();
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const typeOptions = [
    { value: "income", label: t("income") || "Thu nhập" },
    { value: "expense", label: t("expense") || "Chi tiêu" },
  ];

  const categorySelectOptions = useMemo(
    () =>
      categoryList.map((cat) => ({
        value: cat.key,
        label: `${cat.icon} ${t(`categories.${cat.key}`)}`,
      })),
    [t]
  );

  // --- 2. LOCAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailTransaction, setDetailTransaction] = useState(null);

  // State cho Confirm Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // State Filters
  const [filters, setFilters] = useState({
    keyword: "",
    type: "",
    category: "",
    startDate: defaultStartDate.toISOString().split("T")[0],
    endDate: defaultEndDate.toISOString().split("T")[0],
  });

  // --- 3. LOGIC & EFFECTS ---

  // Gom nhóm giao dịch theo ngày
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  // Debounce Search
  const debouncedFetch = useMemo(
    () =>
      debounce((currentFilters) => {
        // Reset về trang 1 khi filter thay đổi
        dispatch(getTransactions({ ...currentFilters, page: 1 }));
      }, 500),
    [dispatch]
  );

  // Handler thay đổi filter
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handler Reset
  const handleResetFilter = () => {
    setFilters({
      keyword: "",
      type: "",
      category: "",
      startDate: defaultStartDate.toISOString().split("T")[0],
      endDate: defaultEndDate.toISOString().split("T")[0],
    });
  };

  // Effect: Gọi API khi filter thay đổi
  useEffect(() => {
    debouncedFetch(filters);
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch]);

  // Effect: Gọi Dashboard API để lấy tổng thu/chi theo filter
  useEffect(() => {
    dispatch(
      getDashboard({
        start: filters.startDate,
        end: filters.endDate,
        currency: userCurrency,
      })
    );
  }, [dispatch, filters.startDate, filters.endDate, userCurrency]);

  // Effect: Refetch khi có thay đổi (thêm/sửa/xóa thành công)
  useEffect(() => {
    if (shouldRefetch) {
      dispatch(getTransactions({ ...filters, page: 1 }));
      dispatch(setShouldRefetch(false));
      // Cập nhật lại cả dashboard stats
      dispatch(
        getDashboard({
          start: filters.startDate,
          end: filters.endDate,
          currency: userCurrency,
        })
      );
    }
  }, [dispatch, shouldRefetch, filters, userCurrency]);

  // --- 4. HANDLERS ---

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      dispatch(getTransactions({ ...filters, page: page + 1 }));
    }
  };

  const handleAdd = () => {
    setSelectedTransaction(null);
    setShowModal(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  // Mở modal xóa
  const handleDeleteClick = (e, transaction) => {
    e.stopPropagation(); // Ngăn chặn click vào row
    setTransactionToDelete(transaction);
    setDeleteModalOpen(true);
  };

  // Thực hiện xóa
  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    const action = dispatch(
      deleteTransaction(transactionToDelete._id)
    ).unwrap();
    toast.promise(action, {
      loading: "Đang xóa...",
      success: "Đã xóa thành công!",
      error: (err) => err?.message || "Lỗi khi xóa!",
    });

    setDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  // Accessibility: Hỗ trợ phím Enter/Space
  const handleKeyDown = (e, action, param) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action(param);
    }
  };

  // --- 5. RENDER ---
  return (
    <>
      <Helmet>
        <title>{t("transactions")} | FinTrack</title>
        <meta name="description" content="Quản lý thu chi chi tiết." />
      </Helmet>

      <main className="min-h-screen w-full bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-6 xl:p-8 transition-colors duration-300">
        {/* --- A. SUMMARY CARDS (Mobile Friendly) --- */}
        <section
          aria-label="Thống kê nhanh"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {/* Income */}
          <div className="bg-white dark:bg-[#2E2E33] p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              {t("totalIncome")}
            </span>
            <span className="text-xl font-bold text-green-600 mt-1 truncate">
              + {formatCurrency(totalIncome, userCurrency, i18n.language)}
            </span>
          </div>
          {/* Expense */}
          <div className="bg-white dark:bg-[#2E2E33] p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              {t("totalExpense")}
            </span>
            <span className="text-xl font-bold text-red-600 mt-1 truncate">
              - {formatCurrency(totalExpense, userCurrency, i18n.language)}
            </span>
          </div>
          {/* Total Count */}
          <div className="bg-white dark:bg-[#2E2E33] p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              {t("totalTransactions")}
            </span>
            <span className="text-xl font-bold text-indigo-600 mt-1">
              {total} giao dịch
            </span>
          </div>
        </section>

        {/* --- B. FILTER TOOLBAR --- */}
        <section
          aria-label="Bộ lọc"
          className="bg-white dark:bg-[#2E2E33] p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-700"
        >
          {/* Hàng 1: Search & Add */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleChange}
                placeholder={t("searchPlaceholder") || "Tìm kiếm..."}
                aria-label="Tìm kiếm giao dịch"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#3a3a41] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
              aria-label={t("addTransaction")}
            >
              <Plus size={20} />
              <span>{t("add")}</span>
            </button>
          </div>

          {/* Hàng 2: Filters */}
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
            {/* Date Range */}
            <div className="flex items-center bg-gray-50 dark:bg-[#3a3a41] rounded-lg border border-gray-200 dark:border-gray-600 p-1">
              <div className="relative flex items-center pl-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  max={filters.endDate}
                  onChange={handleChange}
                  className="pl-2 pr-1 py-1.5 bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 cursor-pointer outline-none"
                  aria-label="Ngày bắt đầu"
                />
              </div>
              <ArrowRight size={16} className="text-gray-400 mx-1" />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                min={filters.startDate}
                onChange={handleChange}
                className="pl-2 pr-2 py-1.5 bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 cursor-pointer outline-none"
                aria-label="Ngày kết thúc"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-1 gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <FilterSelect
                name="type"
                value={filters.type}
                onChange={handleChange}
                options={typeOptions}
                placeholder={t("allType") || "Tất cả loại"}
                icon={Filter}
              />
              <FilterSelect
                name="category"
                value={filters.category}
                onChange={handleChange}
                options={categorySelectOptions}
                placeholder={t("allCategory") || "Tất cả danh mục"}
              />

              {/* Reset Button */}
              {(filters.keyword ||
                filters.type ||
                filters.category ||
                filters.startDate !==
                  defaultStartDate.toISOString().split("T")[0]) && (
                <button
                  onClick={handleResetFilter}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                  aria-label="Xóa bộ lọc"
                >
                  <X size={16} />
                  <span className="hidden sm:inline">
                    {t("clearFilter") || "Xóa lọc"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* --- C. TRANSACTION LIST (Grouped) --- */}
        <section aria-label="Danh sách giao dịch" className="space-y-6">
          {/* Loading Skeleton (Chỉ hiện khi load lần đầu/filter) */}
          {loading && transactions.length === 0 ? (
            <Shimmer />
          ) : groupedTransactions.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-[#2E2E33] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {t("noData")}
              </p>
              <button
                onClick={handleResetFilter}
                className="mt-2 text-indigo-500 hover:underline text-sm"
              >
                Thử xóa bộ lọc
              </button>
            </div>
          ) : (
            groupedTransactions.map((group) => (
              <article
                key={group.date}
                className="bg-white dark:bg-[#2E2E33] rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Header Ngày */}
                <header className="bg-gray-50 dark:bg-[#3a3a41] px-4 py-3 border-b border-gray-100 dark:border-slate-600 flex justify-between items-center sticky top-0 z-10">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                    {formatDateToString(group.date)}
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-200 dark:bg-slate-600 rounded-full text-gray-600 dark:text-gray-300">
                    {group.items.length} giao dịch
                  </span>
                </header>

                {/* List Items */}
                <div role="list">
                  {group.items.map((item) => (
                    <div
                      key={item._id}
                      role="listitem"
                      tabIndex={0}
                      onClick={() => setDetailTransaction(item)}
                      onKeyDown={(e) =>
                        handleKeyDown(e, setDetailTransaction, item)
                      }
                      className="group flex items-center justify-between p-4 border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-indigo-50/30 dark:hover:bg-white/5 cursor-pointer transition-colors outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    >
                      {/* Left: Icon & Text */}
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100 dark:bg-slate-700 shrink-0 shadow-sm">
                          {categoryList.find((c) => c.key === item.category)
                            ?.icon || "🏷️"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base truncate">
                            {t(`categories.${item.category}`)}
                          </span>
                          {item.note && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-[300px]">
                              {item.note}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-4 pl-2">
                        <span
                          className={`font-bold text-sm sm:text-base whitespace-nowrap ${
                            item.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.type === "income" ? "+" : "-"}
                          {formatCurrency(
                            Number(item.amount),
                            item.currency,
                            i18n.language
                          )}
                        </span>

                        {/* Action Buttons (Desktop: Hover / Mobile: Always or use Swipe - here keep simple) */}
                        <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-full transition-all"
                            aria-label="Chỉnh sửa"
                            title={t("edit")}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, item)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-slate-600 rounded-full transition-all"
                            aria-label="Xóa"
                            title={t("delete")}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>

        {/* --- D. LOAD MORE --- */}
        <div
          className="w-full mt-8 mb-10 flex flex-col items-center justify-center gap-3"
          aria-live="polite"
        >
          {loading && page > 1 ? (
            <div className="flex items-center gap-2 text-indigo-600 font-medium">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              <span>Đang tải thêm...</span>
            </div>
          ) : page < totalPages ? (
            <button
              onClick={handleLoadMore}
              className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-[#3a3a41] border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all active:scale-95"
            >
              <span>Xem thêm</span>
              <ChevronDown
                size={16}
                className="group-hover:translate-y-0.5 transition-transform"
              />
            </button>
          ) : transactions.length > 0 ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600"></span>
              <span>Đã hiển thị hết</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600"></span>
            </div>
          ) : null}
        </div>

        {/* --- MODALS --- */}
        {showModal && (
          <TransactionModal
            visible={true}
            onClose={() => setShowModal(false)}
            transaction={selectedTransaction}
          />
        )}

        {detailTransaction && (
          <DetailTransaction
            transaction={detailTransaction}
            onClose={() => setDetailTransaction(null)}
          />
        )}

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          type="delete"
          modalType="transaction"
          transaction={transactionToDelete}
        />
      </main>
    </>
  );
};

export default TransactionPage;
