import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransactions,
  deleteTransaction,
  setShouldRefetch,
} from "../features/transactionSlice";
import { FaEdit, FaTrash } from "react-icons/fa"; // FaPlus đã thay bằng Lucide Plus
import TransactionModal from "../components/TransactionModal";
import DetailTransaction from "../components/DetailTransaction";
import {
  ChevronDown,
  Search,
  Filter,
  X,
  Plus,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Shimmer from "../components/Loading/Shimmer";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { getDashboard } from "../features/dashboardSlice";
import formatDateToString from "../utils/formatDateToString";
import { formatCurrency } from "../utils/formatCurrency";
import { categoryList } from "../utils/categoryList";
import { groupTransactionsByDate } from "../utils/groupTransactions";
import FilterSelect from "../components/TransactionPageComponent/FilterSelect";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

const TransactionPage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { transactions, loading, total, page, totalPages, shouldRefetch } =
    useSelector((s) => s.transaction);
  const userCurrency = useSelector((state) => state.auth.user.currency);
  const { totalIncome, totalExpense, balance } = useSelector(
    (state) => state.dashboard
  );

  // 1. Khởi tạo giá trị mặc định
  const today = new Date();
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailTransaction, setDetailTransaction] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  const [filters, setFilters] = useState({
    keyword: "",
    type: "",
    category: "",
    startDate: defaultStartDate.toISOString().split("T")[0],
    endDate: defaultEndDate.toISOString().split("T")[0],
  });

  const debouncedFetch = useMemo(
    () =>
      debounce((currentFilters) => {
        dispatch(getTransactions(currentFilters));
      }, 500),
    [dispatch]
  );

  useEffect(() => {
    debouncedFetch(filters);
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilter = () => {
    setFilters({
      keyword: "",
      type: "",
      category: "",
      startDate: defaultStartDate.toISOString().split("T")[0],
      endDate: defaultEndDate.toISOString().split("T")[0],
    });
  };

  const { type, category, startDate, endDate, keyword } = filters;

  useEffect(() => {
    dispatch(
      getDashboard({ start: startDate, end: endDate, currency: userCurrency })
    );
  }, [dispatch, startDate, endDate, transactions]);

  useEffect(() => {
    if (shouldRefetch) {
      dispatch(getTransactions(filters));
      dispatch(setShouldRefetch(false));
    }
  }, [dispatch, shouldRefetch]);

  // useEffect(() => {
  //   const params = { ...filters, page: 1 };
  //   dispatch(getTransactions(params));
  // }, [
  //   dispatch,
  //   filters.type,
  //   filters.category,
  //   filters.startDate,
  //   filters.endDate,
  //   filters.keyword,
  // ]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      dispatch(getTransactions({ ...filters, page: page + 1 }));
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedTransaction(null);
    setShowModal(true);
  };

  const handleDeleteClick = (e, transaction) => {
    e.stopPropagation();
    setTransactionToDelete(transaction);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    // 1. Bật trạng thái loading để Modal hiện spinner
    setIsDeleting(true);

    try {
      // 2. Gọi API xóa
      await dispatch(deleteTransaction(transactionToDelete._id)).unwrap();

      // 3. Thông báo thành công
      toast.success(
        t("transactionDeleteSuccess") || "Đã xóa giao dịch thành công!"
      );

      // 4. Đóng modal và reset
      setDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (err) {
      // 5. Thông báo lỗi (Không đóng modal để user thử lại)
      toast.error(err?.message || "Có lỗi xảy ra khi xóa!");
    } finally {
      // 6. Tắt loading dù thành công hay thất bại
      setIsDeleting(false);
    }
  };

  // --- A11Y HELPER: Hỗ trợ phím Enter/Space cho các thẻ div tương tác ---
  const handleKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    /* SEO: Sử dụng <main> thay vì <div> cho nội dung chính */
    <main className="min-h-screen w-full bg-[#F5F6FA] 2xl:px-6 2xl:py-2 3xl:px-8 3xl:py-2 dark:bg-[#35363A]">
      <h1 className="sr-only">Quản lý giao dịch tài chính</h1>
      <section
        aria-label="Bộ lọc tìm kiếm"
        className="flex flex-col gap-2 lg:flex-row justify-between 2xl:gap-6 3xl:gap-8 bg-[#F5F6FA] 2xl:p-6 3xl:p-8 rounded-md flex-wrap dark:bg-[#35363A]"
      >
        {/* --- FILTER BAR --- */}
        <div className="my-1 flex flex-col justify-center bg-white dark:bg-[#2E2E33] p-4 rounded shadow-sm border border-slate-200 dark:border-slate-700 ">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            {/* Search */}
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleChange}
                placeholder={t("searchPlaceholder") || "Tìm kiếm giao dịch..."}
                aria-label={t("searchPlaceholder") || "Tìm kiếm giao dịch"} // A11y: Label cho input
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-[#3a3a41] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none  focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              aria-label={t("add") + " giao dịch mới"}
              className="w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus size={20} aria-hidden="true" />
              <span>{t("add")}</span>
            </button>
          </div>

          {/* Filters Row 2 */}
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
            {/* Date Range */}
            <div
              className="flex items-center bg-gray-50 dark:bg-[#3a3a41] rounded-lg border border-gray-200 dark:border-gray-600 p-1"
              role="group"
              aria-label="Chọn khoảng thời gian"
            >
              <div className="relative">
                <div className="pl-3 flex items-center">
                  <Calendar
                    className="h-4 w-4 text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    max={filters.endDate}
                    onChange={handleChange}
                    aria-label={t("startDate") || "Ngày bắt đầu"} // A11y
                    className="pl-2 pr-2 py-1.5 bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 cursor-pointer w-32"
                  />
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 mx-1"
                aria-hidden="true"
              />
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  min={filters.startDate}
                  onChange={handleChange}
                  aria-label={t("endDate") || "Ngày kết thúc"} // A11y
                  className="pl-2 pr-2 py-1.5 bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 cursor-pointer w-32"
                />
              </div>
            </div>

            {/* Dropdowns */}
            <div className="flex flex-1 gap-4 w-full md:w-auto overflow-x-auto">
              <FilterSelect
                name="type"
                value={filters.type}
                onChange={handleChange}
                options={typeOptions}
                placeholder={t("allType") || "Tất cả loại"}
                icon={Filter}
                aria-label={t("type")} // Truyền prop này nếu FilterSelect hỗ trợ, không thì bọc ngoài
              />

              <FilterSelect
                name="category"
                value={filters.category}
                onChange={handleChange}
                options={categorySelectOptions}
                placeholder={t("allCategory") || "Tất cả danh mục"}
                aria-label={t("categoriesLabel")}
              />

              {/* Reset Button */}
              {(filters.keyword ||
                filters.type ||
                filters.category ||
                filters.startDate !==
                  defaultStartDate.toISOString().split("T")[0]) && (
                <button
                  onClick={handleResetFilter}
                  aria-label={t("clearFilter") || "Xóa bộ lọc"} // A11y
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  <X size={16} aria-hidden="true" />
                  {t("clearFilter") || "Xóa lọc"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY SECTION */}
        {/* SEO: Dùng <section> hoặc <aside> cho thông tin bổ trợ */}
        <section
          aria-label="Tóm tắt thu chi"
          className="bg-white shadow-sm border border-slate-200 mt-2 rounded-md p-4 2xl:p-6 3xl:p-8 flex justify-between items-center flex-2 min-w-[300px] 2xl:min-w-[400px] 3xl:min-w-[500px] dark:bg-[#2E2E33] dark:border dark:border-slate-700"
        >
          {/* --- CỘT TRÁI: THU - CHI - SỐ DƯ --- */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Total Income */}
            <div className="flex justify-between text-[12px] 2xl:text-sm 3xl:text-base mb-2">
              <span className="text-gray-700 font-medium dark:text-white/90">
                {t("totalIncome")}:
              </span>
              <span className="text-green-600 font-semibold text-right dark:text-green-500">
                + {formatCurrency(totalIncome, userCurrency, i18n.language)}
              </span>
            </div>

            {/* Total Expense */}
            <div className="flex justify-between text-[12px] 2xl:text-sm 3xl:text-base mb-2">
              <span className="text-gray-700 font-medium dark:text-white/90">
                {t("totalExpense")}:
              </span>
              <span className="text-red-600 font-semibold text-right dark:text-red-500">
                - {formatCurrency(totalExpense, userCurrency, i18n.language)}
              </span>
            </div>

            {/* Đường kẻ ngang phân cách */}
            <hr className="border-t border-slate-200 dark:border-slate-600 my-1" />

            {/* Balance (Mới thêm) */}
            <div className="flex justify-between text-[13px] 2xl:text-[15px] 3xl:text-lg mt-2">
              <span className="text-gray-900 font-bold dark:text-white">
                {t("balance")}:
              </span>
              <span
                className={`font-bold text-right ${
                  balance >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-500"
                }`}
              >
                {balance >= 0 ? "+" : ""}{" "}
                {formatCurrency(balance, userCurrency, i18n.language)}
              </span>
            </div>
          </div>

          {/* --- ĐƯỜNG KẺ DỌC (DIVIDER) --- */}
          {/* Đổi từ h-16 sang self-stretch để tự động cao theo nội dung bên trái */}
          <div
            className="w-[1px] self-stretch bg-gray-300 mx-4 2xl:mx-6 dark:bg-slate-600"
            aria-hidden="true"
          />

          {/* --- CỘT PHẢI: SỐ LƯỢNG GIAO DỊCH --- */}
          <div className="flex flex-col justify-center h-full">
            <div className="text-[12px] 2xl:text-sm 3xl:text-base text-gray-700 whitespace-nowrap">
              <p className="font-medium dark:text-white/90 mb-1">
                {t("totalTransactions")}:
              </p>
              <p className="text-indigo-500 font-bold text-right text-lg 2xl:text-xl dark:text-indigo-400">
                {total}
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* TRANSACTIONS LIST */}
      {/* SEO: Dùng <section> cho danh sách chính */}
      <section
        aria-label="Danh sách giao dịch chi tiết"
        className="bg-white rounded-md shadow p-4 2xl:p-4 3xl:p-6 overflow-x-auto dark:bg-[#2E2E33] mt-2 dark:border dark:border-slate-700"
      >
        <div className="mt-4 space-y-6">
          {loading && transactions.length === 0 ? (
            <Shimmer />
          ) : groupedTransactions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">{t("noData")}</div>
          ) : (
            groupedTransactions.map((group) => (
              // SEO: Dùng <article> cho mỗi nhóm ngày
              <article
                key={group.date}
                className="bg-white dark:bg-[#2E2E33] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Header Ngày - SEO: Dùng <h3> hoặc <h4> */}
                <header className="bg-gray-50 dark:bg-[#3a3a41] px-4 py-2 border-b border-gray-100 dark:border-slate-600 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm xl:text-base">
                    {formatDateToString(group.date)}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {group.items.length} giao dịch
                  </span>
                </header>

                {/* Danh sách items - A11y: Dùng role="list" */}
                <div role="list">
                  {group.items.map((item) => (
                    // A11y: role="listitem", tabIndex="0" để focus được, onKeyDown để bấm Enter
                    <div
                      key={item._id}
                      role="listitem"
                      tabIndex={0}
                      onClick={() => setDetailTransaction(item)}
                      onKeyDown={(e) =>
                        handleKeyDown(e, () => setDetailTransaction(item))
                      }
                      className="flex items-center justify-between p-4 border-b text-[12px] lg:text-sm xl:text-base border-gray-50 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-[#45454d] cursor-pointer transition-colors group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                      aria-label={`Giao dịch ${t(
                        `categories.${item.category}`
                      )} số tiền ${formatCurrency(
                        Number(item.amount),
                        item.currency,
                        i18n.language
                      )}`}
                    >
                      {/* Cột Trái */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100 dark:bg-slate-600`}
                          aria-hidden="true"
                        >
                          {categoryList.find((c) => c.key === item.category)
                            ?.icon || "🏷️"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {t(`categories.${item.category}`)}
                          </span>
                          {item.note && (
                            <span className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[300px]">
                              {item.note}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cột Phải */}
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-bold ${
                            item.type === "income"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {item.type === "income" ? "+" : "-"}
                          {formatCurrency(
                            Number(item.amount),
                            item.currency,
                            i18n.language
                          )}
                        </span>

                        {/* Actions */}
                        <div className="md:flex group-hover:opacity-100 transition-opacity gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            aria-label={t("edit")} // A11y
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-full cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <FaEdit aria-hidden="true" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, item)}
                            aria-label={t("delete")} // A11y
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded-full cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <FaTrash aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* LOAD MORE SECTION */}
      <div className="w-full mt-6 mb-10 flex flex-col items-center justify-center gap-2">
        {transactions.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            Đang hiển thị {transactions.length} trên tổng số {total} giao dịch
          </p>
        )}

        {loading && page > 1 ? (
          <div
            className="flex items-center gap-2 text-indigo-500 font-medium cursor-progress"
            role="status"
            aria-live="polite"
          >
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Đang tải thêm...</span>
          </div>
        ) : page < totalPages ? (
          <button
            onClick={handleLoadMore}
            aria-label="Xem thêm giao dịch" // A11y
            className="group flex items-center gap-2 px-6 py-2.5 rounded-full cursor-pointer bg-white dark:bg-[#3a3a41] border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span>Xem thêm giao dịch cũ hơn</span>
            <ChevronDown
              size={16}
              className="group-hover:translate-y-0.5 transition-transform"
              aria-hidden="true"
            />
          </button>
        ) : transactions.length > 0 ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
            <span
              className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600"
              aria-hidden="true"
            ></span>
            <span>Bạn đã xem hết danh sách</span>
            <span
              className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600"
              aria-hidden="true"
            ></span>
          </div>
        ) : null}
      </div>

      {/* MODALS (Giữ nguyên) */}
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
        isLoading={isDeleting} // Truyền state loading vào đây
        // --- CÁC PROPS MỚI ---
        title={t("deleteTransactionTitle") || "Xóa giao dịch này?"} // Tiêu đề
        message={
          // Nội dung chi tiết
          transactionToDelete
            ? `${t("deleteConfirmation")} ${formatCurrency(
                transactionToDelete.amount,
                transactionToDelete.currency
              )}?`
            : t("defaultDeleteMessage")
        }
        variant="danger" // Màu đỏ cảnh báo
        confirmText={t("delete") || "Xóa bỏ"} // Chữ trên nút
        cancelText={t("cancel") || "Hủy"}
      />
    </main>
  );
};

export default TransactionPage;
