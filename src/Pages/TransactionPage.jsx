import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransactions,
  deleteTransaction,
  setShouldRefetch,
} from "../features/transactionSlice";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import getUsedCategories from "../thunks/getUsedCategories";
import formatCurrency from "../utils/formatCurrency";
import TransactionModal from "../components/TransactionModal";
import DetailTransaction from "../components/DetailTransaction";
import { ChevronDown } from "lucide-react";
import Shimmer from "../components/Loading/Shimmer";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { getDashboard } from "../features/dashboardSlice";
import formatDateToString from "../utils/formatDateToString";

const TransactionPage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { transactions, loading, total, page, totalPages, shouldRefetch } =
    useSelector((s) => s.transaction);
  const { totalIncome, totalExpense } = useSelector((state) => state.dashboard);
  const categoryList = [
    { key: "sales", icon: "🛍️", color: "#f87171" }, // đỏ hồng
    { key: "transportation", icon: "🚗", color: "#60a5fa" }, // xanh dương nhạt
    { key: "education", icon: "📚", color: "#fbbf24" }, // vàng
    { key: "entertainment", icon: "🎮", color: "#a78bfa" }, // tím nhạt
    { key: "shopping", icon: "🛒", color: "#fb923c" }, // cam sáng
    { key: "housing", icon: "🏠", color: "#34d399" }, // xanh lá nhạt
    { key: "health", icon: "🩺", color: "#ef4444" }, // đỏ
    { key: "rent", icon: "🏘️", color: "#4ade80" }, // xanh lá sáng
    { key: "bonus", icon: "🎁", color: "#facc15" }, // vàng sáng
    { key: "salary", icon: "💰", color: "#22c55e" }, // xanh lá cây
    { key: "food", icon: "🍽️", color: "#c084fc" }, // tím
    { key: "investment", icon: "📈", color: "#0ea5e9" }, // xanh cyan
    { key: "other", icon: "🏳️", color: "#808080" },
  ];

  const categoryOptions = [
    { value: "", label: t("all") }, // All
    ...categoryList.map((cat) => ({
      value: cat.key,
      label: `${cat.icon} ${t(`categories.${cat.key}`)}`,
    })),
  ];
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailTransaction, setDetailTransaction] = useState(null);
  const today = new Date();
  // 🗓️ Lấy ngày đầu tháng
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  // 🗓️ Lấy ngày cuối tháng
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [rawKeyword, setRawKeyword] = useState("");
  const [rawCategory, setRawCategory] = useState("");
  const typeOptions = ["All", "income", "expense"];

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: firstDay,
    endDate: lastDay,
    keyword: "",
  });
  const debouncedSearch = useMemo(
    () =>
      debounce((keywordVal, categoryVal) => {
        setFilters((prev) => ({
          ...prev,
          keyword: keywordVal,
          category: categoryVal === "All" ? "" : categoryVal,
        }));
      }, 500),
    []
  );

  const handleKeywordChange = (e) => {
    const val = e.target.value;
    setRawKeyword(val);
    debouncedSearch(val, rawCategory);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setRawCategory(val);
    debouncedSearch(rawKeyword, val);
  };

  const { type, category, startDate, endDate, keyword } = filters;

  useEffect(() => {
    dispatch(getDashboard({ start: startDate, end: endDate }));
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "All" ? "" : value,
    }));
  };

  const handleLoadMore = async () => {
    if (page < totalPages) {
      await dispatch(getTransactions({ ...filters, page: page + 1 }));
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

  const years = Array.from({ length: 8 }, (_, i) => String(2018 + i));

  const Select = ({ label, name, value, options, onChange, render }) => (
    <div className="relative">
      <label className="block text-[12px] 2xl:text-sm 3xl:text-base font-medium text-gray-600 mb-1 2xl:mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="
            appearance-none w-full bg-white text-gray-400 px-3 py-2 2xl:px-4 2xl:py-2 3xl:px-5 3xl:py-3 pr-8 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer text-sm 2xl:text-sm
            dark:bg-[#2E2E33] dark:text-white/90 dark:border-slate-700
          "
        >
          {options.map((opt) => (
            <option
              key={opt}
              value={opt === t("all") ? "" : opt}
              className="w-full bg-white text-black dark:bg-[#2E2E33] dark:text-white/90"
            >
              {render ? render(opt) : opt}
            </option>
          ))}
        </select>
        {/* Mũi tên xanh */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center transform -translate-x-5">
          <ChevronDown
            className="text-indigo-500 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6"
            size={18}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#F5F6FA] p-4 2xl:px-6 2xl:py-2 3xl:px-8 3xl:py-2 dark:bg-[#35363A] ">
      <div className="flex flex-col lg:flex-row justify-between gap-4 2xl:gap-6 3xl:gap-8 bg-[#F5F6FA] p-4 2xl:p-6 3xl:p-8 rounded-md flex-wrap dark:bg-[#35363A]">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6 3xl:gap-8 flex-[3]">
          {/* Loại giao dịch */}
          <Select
            label={t("type")}
            name="type"
            value={filters.type}
            options={typeOptions}
            onChange={handleFilterChange}
            render={(opt) => {
              switch (opt) {
                case "All":
                  return t("all");
                case "income":
                  return t("income");
                case "expense":
                  return t("expense");
                default:
                  return opt;
              }
            }}
          />

          {/* Danh mục */}
          <Select
            label={t("categoriesLabel")}
            name="category"
            value={filters.category}
            options={categoryOptions.map((opt) => opt.label)}
            onChange={(e) => {
              const selectedLabel = e.target.value;
              const selected = categoryOptions.find(
                (o) => o.label === selectedLabel
              );
              handleCategoryChange({
                target: { value: selected?.value || "" },
              });
            }}
          />

          {/* Ngày bắt đầu */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {t("startDate")}
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              max={filters.endDate} // Không cho chọn ngày vượt quá endDate
              className="bg-white text-gray-400 px-3 py-2 2xl:px-4 2xl:py-2 3xl:px-5 3xl:py-3 pr-8 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer text-sm 2xl:text-sm
            dark:bg-[#2E2E33] dark:text-white/90 dark:border-slate-700"
            />
          </div>

          {/* Ngày kết thúc */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {t("endDate")}
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              min={filters.startDate} // Không cho chọn ngày nhỏ hơn startDate
              className="bg-white text-gray-400 px-3 py-2 2xl:px-4 2xl:py-2 3xl:px-5 3xl:py-3 pr-8 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer text-sm 2xl:text-sm
            dark:bg-[#2E2E33] dark:text-white/90 dark:border-slate-700"
            />
          </div>
        </div>

        {/* SUMMARY - bên phải */}
        <div
          className="
            bg-white mt-2 rounded-md p-4 2xl:p-6 3xl:p-8 flex justify-between items-center flex-[2] min-w-[300px] 2xl:min-w-[400px] 3xl:min-w-[500px] 
            dark:bg-[#2E2E33] dark:border dark:border-slate-700 
        "
        >
          <div className="flex-1">
            <div className="flex justify-between text-[12px] 2xl:text-sm 3xl:text-base mb-2 2xl:mb-3">
              <span className="text-gray-700 font-medium dark:text-white/90">
                {t("totalIncome")}:
              </span>
              <span className="text-green-600 font-semibold text-right dark:text-green-700">
                +{formatCurrency(totalIncome)} đ
              </span>
            </div>
            <hr className="text-slate-300 dark:text-slate-700" />
            <div className="flex justify-between text-[12px] 2xl:text-sm 3xl:text-base mt-2 2xl:mt-3">
              <span className="text-gray-700 font-medium dark:text-white/90">
                {t("totalExpense")}:
              </span>
              <span className="text-red-600 font-semibold text-right dark:text-red-700">
                -{formatCurrency(totalExpense)} đ
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

      <div className="bg-white rounded-md shadow p-4 2xl:p-4 3xl:p-6 overflow-x-auto dark:bg-[#2E2E33] mt-2 md:mt-4 dark:border dark:border-slate-700">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 2xl:gap-4 3xl:gap-6 mt-2">
          {/* Ô tìm kiếm */}
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={rawKeyword}
            onChange={handleKeywordChange}
            className="
              w-full sm:w-1/2 px-4 py-2 2xl:px-5 2xl:py-3 3xl:px-6 3xl:py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300 text-sm 2xl:text-base 3xl:text-lg
              dark:border-slate-700 dark:text-white/83 dark:focus:ring-indigo-500 dark:focus:ring-1
            "
          />

          {/* Select category */}
          <select
            name="category"
            value={rawCategory}
            onChange={handleCategoryChange}
            className="
              w-full sm:w-2/6 px-3 py-2 2xl:px-4 2xl:py-3 3xl:px-5 3xl:py-4 border border-gray-300 text-gray-600 text-sm 2xl:text-base 3xl:text-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer
              dark:border-slate-700 dark:text-white/83 dark:focus:ring-1 dark:focus:ring-indigo-500
            "
          >
            {categoryOptions.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="dark:bg-[#2E2E33] dark:text-white/83"
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Nút Add */}
          <button
            onClick={handleAdd}
            className="
              bg-indigo-500 hover:bg-indigo-600 text-white justify-center font-semibold text-[12px] sm:w-1/6 2xl:text-sm py-2 px-4 2xl:py-3 2xl:px-6 3xl:py-4 3xl:px-8 rounded w-full flex items-center gap-2 2xl:gap-3 cursor-pointer
              dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white/83 3xl:text-lg
            "
          >
            + {t("add")}
          </button>
        </div>

        <table className="w-full text-left text-[12px] sm:text-sm lg:text-base 3xl:text-lg mt-4 2xl:mt-6 3xl:mt-8">
          <thead>
            <tr className="text-gray-600 border-b-2 dark:text-white/90">
              <th className="py-2 2xl:py-3 3xl:py-4">{t("categoriesLabel")}</th>
              <th className="py-2 2xl:py-3 3xl:py-4">{t("amount")}</th>
              <th className="py-2 2xl:py-3 3xl:py-4">{t("date")}</th>
              <th className="hidden sm:table-cell py-2 2xl:py-3 3xl:py-4">
                {t("note")}
              </th>
              <th className="py-2 2xl:py-3 3xl:py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, index) => (
                <tr
                  key={index}
                  className="relative h-12 2xl:h-16 3xl:h-20 overflow-hidden"
                >
                  <td
                    colSpan="6"
                    className="relative rounded-md bg-slate-200 dark:bg-[#2E2E33] shimmer"
                  >
                    <Shimmer />
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4 2xl:py-6 3xl:py-8 text-sm 2xl:text-base 3xl:text-lg dark:text-white/83"
                >
                  {t("noData")}
                </td>
              </tr>
            ) : (
              transactions.map((item, i) => (
                <tr
                  key={i}
                  className="px-5 border-b border-slate-600 cursor-pointer text-[12px] md:text-sm xl:text-base 3xl:text-[17px] hover:bg-gray-100 hover:opacity-80 transition duration-200 dark:text-white/83 dark:hover:bg-[#3a3a41]"
                  onClick={() => setDetailTransaction(item)}
                >
                  <td className="py-3 px-2 2xl:py-4 3xl:py-5">
                    {t(`categories.${item.category}`)}
                  </td>
                  <td
                    className={`py-3 2xl:py-4 3xl:py-5 ${
                      item.type === "income"
                        ? "text-green-600 dark:text-green-700"
                        : "text-red-600 dark:text-red-700"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(item.amount))} đ
                  </td>
                  <td className="py-3 2xl:py-4 3xl:py-5">
                    {formatDateToString(item.date)}
                  </td>
                  <td className="hidden sm:table-cell py-3 2xl:py-4 3xl:py-5">
                    {item.note || "-"}
                  </td>
                  <td className="py-3 2xl:py-4 3xl:py-5 text-right pr-5">
                    <span className="inline-flex gap-2 2xl:gap-3 3xl:gap-4 text-gray-600">
                      <FaEdit
                        className="cursor-pointer hover:text-blue-500 2xl:w-4 2xl:h-4 3xl:w-5 3xl:h-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                      />
                      <FaTrash
                        className="cursor-pointer hover:text-red-500 2xl:w-4 2xl:h-4 3xl:w-5 3xl:h-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(deleteTransaction(item._id));
                        }}
                      />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="w-full">
        {totalPages > 1 && page < totalPages && (
          <div className="w-full flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="p-2  rounded-full transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="text-indigo-500 text-base 2xl:text-base 3xl:text-lg">
                  Loading...
                </span>
              ) : (
                <ChevronDown className="text-indigo-600 lg:w-8 lg:h-8 xl:w-10 xl:h-10 xl:m-2 3xl:w-11 3xl:h-11 hover:text-indigo-700" />
              )}
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal
          visible={true}
          onClose={() => setShowModal(false)}
          transaction={selectedTransaction}
          categoryList={categoryList}
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
