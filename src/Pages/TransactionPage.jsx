import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransactions,
  deleteTransaction,
  setShouldRefetch,
} from "../features/transactionSlice";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import getUsedCategories from "../thunks/getUsedCategories";
import { formatCurrency } from "../utils/formatCurrency";
import TransactionModal from "../components/TransactionModal";
import DetailTransaction from "../components/DetailTransaction";
import { ChevronDown } from "lucide-react";
import Shimmer from "../components/Loading/Shimmer";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { getDashboard } from "../features/dashboardSlice";
import formatDateToString from "../utils/formatDateToString";
import { getCurrencySymbol } from "../utils/currencies";
import { categoryList } from "../utils/categoryList";
import { groupTransactionsByDate } from "../utils/groupTransactions";
import { Search, Filter, X, Plus, Calendar, ArrowRight } from "lucide-react";
import FilterSelect from "../components/TransactionPageComponent/FilterSelect";

const TransactionPage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { transactions, loading, total, page, totalPages, shouldRefetch } =
    useSelector((s) => s.transaction);
  const userCurrency = useSelector((state) => state.auth.user.currency);
  const { totalIncome, totalExpense } = useSelector((state) => state.dashboard);

  // 1. Khởi tạo giá trị mặc định (để dùng cho Reset)
  const today = new Date();
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailTransaction, setDetailTransaction] = useState(null);

  // 1. Chuẩn bị options cho Loại giao dịch
  const typeOptions = [
    { value: "income", label: t("income") || "Thu nhập" },
    { value: "expense", label: t("expense") || "Chi tiêu" },
  ];

  // 2. Chuẩn bị options cho Danh mục (Giữ nguyên logic của bạn)
  const categorySelectOptions = useMemo(
    () =>
      categoryList.map((cat) => ({
        value: cat.key,
        label: `${cat.icon} ${t(`categories.${cat.key}`)}`,
      })),
    [t]
  );

  // Trong TransactionPage component
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  const [filters, setFilters] = useState({
    keyword: "",
    type: "",
    category: "",
    startDate: defaultStartDate.toISOString().split("T")[0], // Dùng string YYYY-MM-DD cho input date
    endDate: defaultEndDate.toISOString().split("T")[0],
  });
  // 3. Debounce Search (Dùng useCallback để không bị tạo lại mỗi lần render)
  // Lưu ý: debounce của lodash cần được bọc trong useCallback hoặc useMemo
  const debouncedFetch = useMemo(
    () =>
      debounce((currentFilters) => {
        dispatch(getTransactions(currentFilters));
      }, 500),
    [dispatch]
  );

  // 4. Effect: Gọi API khi filters thay đổi
  // Bỏ rawKeyword/rawCategory riêng, dùng chung state filters
  useEffect(() => {
    // Gọi debounce khi filter thay đổi
    debouncedFetch(filters);

    // Cleanup debounce khi unmount
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch]);

  // 5. Handler chung cho tất cả input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 6. Handler Reset Filter
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
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    dispatch(getTransactions(filters));
  }, [dispatch, type, category, startDate, endDate, keyword]);

  useEffect(() => {
    if (shouldRefetch) {
      dispatch(getTransactions(filters));
      dispatch(setShouldRefetch(false));
    }
  }, [dispatch, shouldRefetch]);

  useEffect(() => {
    // Mỗi khi filter đổi, luôn gọi trang 1
    const params = { ...filters, page: 1 };
    dispatch(getTransactions(params));

    // (Tùy chọn) Scroll lên đầu trang khi filter
    // window.scrollTo(0, 0);
  }, [
    dispatch,
    filters.type,
    filters.category,
    filters.startDate,
    filters.endDate,
    filters.keyword,
  ]);

  // 2. Hàm Load More
  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      // Giữ nguyên filters, chỉ tăng page
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

  const handleDelete = (e, id) => {
    e.stopPropagation();

    const action = dispatch(deleteTransaction(id)).unwrap();

    toast.promise(action, {
      loading: "Đang xóa giao dịch...",
      success: "Đã xóa giao dịch thành công!",
      error: (err) => err?.message || "Có lỗi xảy ra khi xóa giao dịch!",
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F6FA] 2xl:px-6 2xl:py-2 3xl:px-8 3xl:py-2 dark:bg-[#35363A] ">
      <div className="flex flex-col gap-2 lg:flex-row justify-between 2xl:gap-6 3xl:gap-8 bg-[#F5F6FA] 2xl:p-6 3xl:p-8 rounded-md flex-wrap dark:bg-[#35363A]">
        {/* --- NEW FILTER BAR --- */}
        <div className="my-1 flex flex-col justify-center bg-white dark:bg-[#2E2E33] p-4 rounded shadow-sm border border-slate-200 dark:border-slate-700 ">
          {/* Hàng 1: Tìm kiếm & Nút Thêm */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            {/* Ô tìm kiếm (Chiếm phần lớn) */}
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleChange}
                placeholder={t("searchPlaceholder") || "Tìm kiếm giao dịch..."}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-[#3a3a41] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none  focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
              />
            </div>

            {/* Nút Thêm (Nổi bật) */}
            <button
              onClick={handleAdd}
              className="w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus size={20} />
              <span>{t("add")}</span>
            </button>
          </div>

          {/* Hàng 2: Các bộ lọc (Date, Type, Category) */}
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
            {/* Nhóm lọc Ngày tháng (Giao diện gắn liền) */}
            <div className="flex items-center bg-gray-50 dark:bg-[#3a3a41] rounded-lg border border-gray-200 dark:border-gray-600 p-1">
              <div className="relative">
                <div className="pl-3 flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    max={filters.endDate}
                    onChange={handleChange}
                    className="pl-2 pr-2 py-1.5 bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 cursor-pointer w-32"
                  />
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 mx-1" />
              <div className="relative">
                {/* (Tùy chọn: Icon calendar thứ 2 hoặc bỏ đi cho gọn) */}
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  min={filters.startDate}
                  onChange={handleChange}
                  className="pl-2 pr-2 py-1.5 bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 cursor-pointer w-32"
                />
              </div>
            </div>

            {/* Nhóm Dropdown (Type & Category) */}
            <div className="flex flex-1 gap-4 w-full md:w-auto overflow-x-auto">
              {/* Sử dụng FilterSelect cho Loại */}
              <FilterSelect
                name="type"
                value={filters.type}
                onChange={handleChange}
                options={typeOptions}
                placeholder={t("allType") || "Tất cả loại"}
                icon={Filter} // (Tùy chọn nếu bạn muốn truyền icon để render custom)
              />

              {/* Sử dụng FilterSelect cho Danh mục */}
              <FilterSelect
                name="category"
                value={filters.category}
                onChange={handleChange}
                options={categorySelectOptions}
                placeholder={t("allCategory") || "Tất cả danh mục"}
              />

              {/* Nút Reset Filter */}
              {(filters.keyword ||
                filters.type ||
                filters.category ||
                filters.startDate !==
                  defaultStartDate.toISOString().split("T")[0]) && (
                <button
                  onClick={handleResetFilter}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  <X size={16} />
                  {t("clearFilter") || "Xóa lọc"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY - bên phải */}
        <div
          className="
            bg-white shadow-sm border border-slate-200 mt-2 rounded-md p-4 2xl:p-6 3xl:p-8 flex justify-between items-center flex-2 min-w-[300px] 2xl:min-w-[400px] 3xl:min-w-[500px] 
            dark:bg-[#2E2E33] dark:border dark:border-slate-700 
        "
        >
          <div className="flex-1">
            <div className="flex justify-between text-[12px] 2xl:text-sm 3xl:text-base mb-2 2xl:mb-3">
              <span className="text-gray-700 font-medium dark:text-white/90">
                {t("totalIncome")}:
              </span>
              <span className="text-green-600 font-semibold text-right dark:text-green-700">
                + {formatCurrency(totalIncome, userCurrency, i18n.language)}
              </span>
            </div>
            <hr className="text-slate-300 dark:text-slate-700" />
            <div className="flex justify-between text-[12px] 2xl:text-sm 3xl:text-base mt-2 2xl:mt-3">
              <span className="text-gray-700 font-medium dark:text-white/90">
                {t("totalExpense")}:
              </span>
              <span className="text-red-600 font-semibold text-right dark:text-red-700">
                - {formatCurrency(totalExpense, userCurrency, i18n.language)}
              </span>
            </div>
          </div>

          <div className="w-[1px] h-16 2xl:h-20 3xl:h-24 bg-gray-300 mx-4 2xl:mx-6 dark:bg-slate-700" />

          <div className="text-[12px] 2xl:text-sm 3xl:text-base text-gray-700 whitespace-nowrap">
            <p className="font-medium dark:text-white/90">
              {t("totalTransactions")}:
            </p>
            <p className="text-indigo-500 font-semibold text-right dark:text-indigo-600">
              {total}{" "}
            </p>
          </div>
        </div>
      </div>
      {/* Transactions List */}
      <div className="bg-white rounded-md shadow p-4 2xl:p-4 3xl:p-6 overflow-x-auto dark:bg-[#2E2E33] mt-2 dark:border dark:border-slate-700">
        <div className="mt-4 space-y-6">
          {loading && transactions.length === 0 ? (
            <Shimmer />
          ) : groupedTransactions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">{t("noData")}</div>
          ) : (
            groupedTransactions.map((group) => (
              <div
                key={group.date}
                className="bg-white dark:bg-[#2E2E33] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Header Ngày */}
                <div className="bg-gray-50 dark:bg-[#3a3a41] px-4 py-2 border-b border-gray-100 dark:border-slate-600 flex justify-between items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {formatDateToString(group.date)}
                    {/* Hàm format ngày của bạn */}
                  </span>
                  <span className="text-xs text-gray-500">
                    {group.items.length} giao dịch
                  </span>
                </div>

                {/* Danh sách giao dịch trong ngày */}
                <div>
                  {group.items.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => setDetailTransaction(item)}
                      className="flex items-center justify-between p-4 border-b text-[12px] lg:text-sm xl:text-base border-gray-50 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-[#45454d] cursor-pointer transition-colors group"
                    >
                      {/* Cột Trái: Icon + Tên + Note */}
                      <div className="flex items-center gap-4">
                        {/* Tìm icon từ categoryList */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100 dark:bg-slate-600`}
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

                      {/* Cột Phải: Số tiền + Actions */}
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

                        {/* Action Buttons (Chỉ hiện khi hover vào dòng - Desktop) */}
                        <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-full cursor-pointer transition-all"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, item._id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded-full cursor-pointer transition-all"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* --- LOAD MORE SECTION --- */}
      <div className="w-full mt-6 mb-10 flex flex-col items-center justify-center gap-2">
        {/* Text thông tin (Optional) */}
        {transactions.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            Đang hiển thị {transactions.length} trên tổng số {total} giao dịch
          </p>
        )}

        {/* Logic hiển thị nút */}
        {loading && page > 1 ? (
          // Case 1: Đang tải thêm (Loading Spinner)
          <div className="flex items-center gap-2 text-indigo-500 font-medium cursor-progress">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
          // Case 2: Còn trang để tải -> Hiện nút
          <button
            onClick={handleLoadMore}
            className="
            group flex items-center gap-2 px-6 py-2.5 rounded-full cursor-pointer
            bg-white dark:bg-[#3a3a41] border border-gray-200 dark:border-slate-600 
            text-sm font-medium text-gray-600 dark:text-gray-300 
            shadow-sm hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 
            transition-all duration-300 active:scale-95
      "
          >
            <span>Xem thêm giao dịch cũ hơn</span>
            <ChevronDown
              size={16}
              className="group-hover:translate-y-0.5 transition-transform"
            />
          </button>
        ) : transactions.length > 0 ? (
          // Case 3: Đã hết dữ liệu -> Hiện thông báo kết thúc
          <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600"></span>
            <span>Bạn đã xem hết danh sách</span>
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600"></span>
          </div>
        ) : null}
      </div>

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
    </div>
  );
};

export default TransactionPage;
