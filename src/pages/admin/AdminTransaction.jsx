import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import Pagination from "../../components/Pagination";
import { FaEdit, FaRegTrashAlt, FaSearch } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import toast from "react-hot-toast";
import {
  adminDeleteTransaction,
  adminGetTransactions,
} from "../../features/transactionSlice";
import { useTranslation } from "react-i18next";
import formatDateToString from "../../utils/formatDateToString";
import TransactionModal from "../../components/TransactionModal";
import DetailTransaction from "../../components/DetailTransaction";
import { getCurrentMonthRange } from "../../utils/dateHelper";
import ConfirmModal from "../../components/ConfirmModal";
import { format } from "date-fns";
import { categoryList } from "../../constant/categoryList";

const CATEGORY_LIST = categoryList;

const AdminTransaction = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Safe Access
  const transactions =
    useSelector((state) => state.transaction.transactions) || [];
  const totalPages = useSelector((state) => state.transaction.totalPages);

  // --- STATE ---
  const { startOfYear, present } = getCurrentMonthRange();

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(present);
  const [page, setPage] = useState(1);

  // DatePicker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const datePickerRef = useRef(null);

  // Modal States
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. API CALL FUNCTION ---
  const fetchTransactions = useCallback(
    (searchTerm, cat, typ, start, end, p) => {
      dispatch(
        adminGetTransactions({
          keyword: searchTerm,
          category: cat === "all" ? "" : cat,
          type: typ === "all" ? "" : typ,
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(end, "yyyy-MM-dd"),
          page: p,
          limit: 10,
        })
      );
    },
    [dispatch]
  );

  // --- 2. DEBOUNCE SEARCH ---
  const debouncedFetch = useMemo(() => {
    return debounce((searchTerm, c, t, s, e, p) => {
      fetchTransactions(searchTerm, c, t, s, e, p);
    }, 500);
  }, [fetchTransactions]);

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  // --- 3. EFFECTS ---
  // Khi Search thay đổi -> Debounce gọi API & Reset Page
  useEffect(() => {
    debouncedFetch(search, category, type, startDate, endDate, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Khi Filter/Page thay đổi -> Gọi ngay lập tức
  useEffect(() => {
    // Tránh gọi trùng nếu search đang chạy (nhưng ở đây gọi lại cũng không sao để đảm bảo data mới nhất)
    fetchTransactions(search, category, type, startDate, endDate, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, type, startDate, endDate, page]);

  // --- HANDLERS ---
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleDateSelectionComplete = () => {
    setShowDatePicker(false);
    setSelectingStartDate(true);
    setPage(1);
  };

  const handleConfirmDelete = async (reason) => {
    if (!selectedTransaction) return;
    setIsDeleting(true);
    try {
      await dispatch(
        adminDeleteTransaction({ id: selectedTransaction._id, reason })
      ).unwrap();
      toast.success("Đã xóa giao dịch thành công!");
      setIsConfirmModalOpen(false);
      // Refresh data
      fetchTransactions(search, category, type, startDate, endDate, page);
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenConfirmModal = (e, tx) => {
    e.stopPropagation();
    setSelectedTransaction(tx);
    setIsConfirmModalOpen(true);
  };

  const handleEdit = (tx) => {
    setSelectedTransaction(tx);
    setIsEditOpen(true);
  };

  const handleDetail = (tx) => {
    setSelectedTransaction(tx);
    setIsDetailOpen(true);
  };

  // --- DATE PICKER HELPERS (Giữ nguyên logic cũ nhưng clean code hơn) ---
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const handleMonthChange = (dir) => {
    if (dir === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (selectingStartDate) {
      setStartDate(selectedDate);
      setSelectingStartDate(false);
    } else {
      if (selectedDate >= startDate) setEndDate(selectedDate);
      else {
        setEndDate(startDate);
        setStartDate(selectedDate);
      }
      handleDateSelectionComplete();
    }
  };

  const getDateRangeDisplay = () =>
    `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;

  // Close Datepicker Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
        setSelectingStartDate(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++)
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isStart = date.toDateString() === startDate.toDateString();
      const isEnd = date.toDateString() === endDate.toDateString();
      const inRange = date > startDate && date < endDate;
      const today = date.toDateString() === new Date().toDateString();

      let classes = "text-gray-700 hover:bg-gray-100";
      if (isStart || isEnd)
        classes =
          "bg-blue-600 text-white font-semibold shadow-md transform scale-105";
      else if (inRange) classes = "bg-blue-50 text-blue-700";
      else if (today) classes = "text-blue-600 font-bold bg-blue-50";

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-all ${classes}`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="p-4 sm:p-6 bg-blue-50/50 min-h-screen">
      {/* Mobile Warning */}
      <div className="sm:hidden text-center text-gray-500 mt-10 px-4">
        Vui lòng sử dụng máy tính để quản lý giao dịch tốt nhất.
      </div>

      <div className="hidden sm:block">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Quản lý giao dịch
        </h1>

        {/* --- MODERN FILTER BAR --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm font-medium">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>Bộ lọc tìm kiếm</span>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 justify-between">
            {/* 1. Search User */}
            <div className="relative w-full xl:w-100 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm theo userId..."
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={search}
                onChange={handleSearchChange}
              />
              {search && (
                <button
                  onClick={() => handleSearchChange({ target: { value: "" } })}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <IoCloseCircle size={18} />
                </button>
              )}
            </div>

            {/* 2. Group Filters */}
            <div className="flex flex-1 flex-wrap gap-3 xl:justify-end">
              {/* Select Type */}
              <div className="relative min-w-[140px]">
                <select
                  value={type}
                  onChange={(e) => handleFilterChange(setType, e.target.value)}
                  className="appearance-none w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 hover:border-blue-400 cursor-pointer"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="income">Thu nhập (Income)</option>
                  <option value="expense">Chi tiêu (Expense)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {/* Select Category */}
              <div className="relative min-w-[160px]">
                <select
                  value={category}
                  onChange={(e) =>
                    handleFilterChange(setCategory, e.target.value)
                  }
                  className="appearance-none w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 hover:border-blue-400 cursor-pointer"
                >
                  <option value="all">Tất cả danh mục</option>
                  {CATEGORY_LIST.map((item) => (
                    <option key={item.key} value={item.key}>
                      {t(`categories.${item.key}`)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {/* Date Picker Trigger */}
              <div className="relative min-w-[220px]" ref={datePickerRef}>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                    <span>{getDateRangeDisplay()}</span>
                  </div>
                </button>

                {/* Calendar Dropdown */}
                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-4 w-80 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-sm text-center font-semibold text-blue-600 mb-3 bg-blue-50 py-1 rounded-lg">
                      {selectingStartDate
                        ? "Chọn ngày bắt đầu"
                        : "Chọn ngày kết thúc"}
                    </p>
                    <div className="flex justify-between items-center mb-4 px-1">
                      <button
                        onClick={() => handleMonthChange("prev")}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="font-bold text-gray-800">
                        {monthNames[currentMonth]} {currentYear}
                      </span>
                      <button
                        onClick={() => handleMonthChange("next")}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {dayNames.map((d) => (
                        <div
                          key={d}
                          className="text-xs text-center font-medium text-gray-400 uppercase"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendar()}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-end">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-semibold text-xs">
                <tr>
                  <th className="p-4">Người dùng</th>
                  <th className="p-4 hidden lg:table-cell">Email</th>
                  <th className="p-4">Loại</th>
                  <th className="p-4">Số tiền</th>
                  <th className="p-4 hidden lg:table-cell">Danh mục</th>
                  <th className="p-4">Ngày</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      onClick={() => handleDetail(tx)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 font-medium text-gray-900">
                        {tx.user?.name || "Unknown"}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-gray-500">
                        {tx.user?.email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            tx.type === "income"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t(tx.type)}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(tx.amount)}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="flex items-center gap-2 text-gray-600">
                          <span>
                            {
                              CATEGORY_LIST.find((c) => c.key === tx.category)
                                ?.icon
                            }
                          </span>
                          {t(`categories.${tx.category}`)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {formatDateToString(tx.date)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(tx);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => handleOpenConfirmModal(e, tx)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FaRegTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODALS --- */}
        {isDetailOpen && selectedTransaction && (
          <DetailTransaction
            transaction={selectedTransaction}
            onClose={() => setIsDetailOpen(false)}
          />
        )}

        {isEditOpen && selectedTransaction && (
          <TransactionModal
            categoryList={CATEGORY_LIST}
            onClose={() => setIsEditOpen(false)}
            transaction={selectedTransaction}
          />
        )}

        {isConfirmModalOpen && selectedTransaction && (
          <ConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => !isDeleting && setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
            title="Xóa giao dịch này?"
            message={`Bạn có chắc chắn muốn xóa giao dịch ${selectedTransaction.amount} của ${selectedTransaction.user?.name}?`}
            variant="danger"
            confirmText="Xóa bỏ"
            requireReason={true}
          />
        )}

        <div className="mt-6 flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminTransaction;
