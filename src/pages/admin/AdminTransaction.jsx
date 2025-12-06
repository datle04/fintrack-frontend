import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Calendar,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import Pagination from "../../components/Pagination";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  adminDeleteTransaction,
  adminGetTransactions,
} from "../../features/transactionSlice";
import { useTranslation } from "react-i18next";
import formatDateToString from "../../utils/formatDateToString";
import TransactionModal from "../../components/TransactionModal";
import DetailTransaction from "../../components/DetailTransaction";
import { getCurrentMonthRange } from "../../utils/dateHelper";
import { SlMagnifier } from "react-icons/sl";
import ConfirmModal from "../../components/ConfirmModal";

const AdminTransaction = () => {
  const { t, i18n } = useTranslation();
  const { startOfYear, present } = getCurrentMonthRange();

  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(present);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [idSearch, setIdSearch] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const datePickerRef = useRef(null);

  const transactions = useSelector((state) => state.transaction.transactions);
  const totalPages = useSelector((state) => state.transaction.totalPages);
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);

  const [selectedTransaction, setSelectedTransaction] = useState();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleDetail = (tx) => {
    setSelectedTransaction(tx);
    setIsDetailOpen(true);
  };

  const handleEdit = (tx) => {
    setSelectedTransaction(tx);
    setIsEditOpen(true);
  };

  const formatToYYYYMMDD = (date) => {
    const d = new Date(date); // đảm bảo là kiểu Date
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    dispatch(
      adminGetTransactions({
        category,
        type,
        startDate,
        endDate,
        page: 1,
      })
    );
    console.log(transactions);
  }, [dispatch, category, type, endDate]);

  useEffect(() => {
    dispatch(
      adminGetTransactions({
        category,
        type,
        startDate: formatToYYYYMMDD(startDate),
        endDate: formatToYYYYMMDD(endDate),
        page,
      })
    );
  }, [page]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await dispatch(adminDeleteTransaction(id));
      toast("Đã xóa giao dịch.", {
        icon: "🗑️",
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra.");
      console.log(error);
    }
  };

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
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDateRange = () => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

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

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);

    if (selectingStartDate) {
      setStartDate(selectedDate);
      setSelectingStartDate(false);
    } else {
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
        setShowDatePicker(false);
        setSelectingStartDate(true);
      } else {
        // If selected end date is before start date, swap them
        setEndDate(startDate);
        setStartDate(selectedDate);
        setShowDatePicker(false);
        setSelectingStartDate(true);
      }
    }
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
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

  const isDateInRange = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return (
      date.getTime() === startDate.getTime() ||
      date.getTime() === endDate.getTime()
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const isInRange = isDateInRange(day);
      const isToday =
        new Date().toDateString() ===
        new Date(currentYear, currentMonth, day).toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-blue-500 text-white font-semibold"
              : isInRange
              ? "bg-blue-100 text-blue-700"
              : isToday
              ? "bg-gray-200 text-gray-900 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Close date picker when clicking outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenConfirmModal = (e, transaction) => {
    e.stopPropagation();
    setSelectedTransaction(transaction);
    setIsConfirmModalOpen(true);
  };

  // 👉 VIẾT HÀM XỬ LÝ XÓA MỚI (Thay thế hàm handleDelete cũ hoặc viết mới)
  const handleConfirmDelete = async (reason) => {
    if (!selectedTransaction) return;

    setIsDeleting(true); // Bật loading
    try {
      await dispatch(
        adminDeleteTransaction({
          id: selectedTransaction._id,
          reason: reason, // Truyền lý do xóa (quan trọng với Admin)
        })
      ).unwrap();

      toast.success("Đã xóa giao dịch thành công!");
      setIsConfirmModalOpen(false); // Đóng modal

      // Load lại trang (nếu cần thiết, tuỳ vào slice của bạn có tự update state không)
      // fetchTransactions();
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa!");
    } finally {
      setIsDeleting(false); // Tắt loading
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-blue-50 min-h-screen">
      {/* Ẩn hoàn toàn trên điện thoại */}
      <div className="sm:hidden text-center text-gray-600 mt-10">
        Trang quản lý người dùng chỉ khả dụng trên máy tính hoặc máy tính bảng.
      </div>

      <div className="hidden sm:block">
        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={type}
            onChange={(e) => {
              e.target.value === "All" ? setType("") : setType(e.target.value);
            }}
            className="border border-slate-300 bg-white cursor-pointer px-4 py-2 rounded shadow-sm focus:outline-none
          "
          >
            <option value="all">Loại</option>
            <option value="income">Thu</option>
            <option value="expense">Chi</option>
          </select>
          <select
            value={category}
            onChange={(e) => {
              e.target.value === "All"
                ? setCategory("")
                : setCategory(e.target.value);
            }}
            className="border border-slate-300 bg-white cursor-pointer px-4 py-2 rounded shadow-sm focus:outline-none
          "
          >
            <option value="all">Danh mục</option>
            {categoryList.map((item) => (
              <option value={item.key}>{t(`categories.${item.key}`)}</option>
            ))}
          </select>

          <div className="flex-1 lg:max-w-xs relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base text-left bg-white"
            >
              {getDateRange()}
            </button>
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {selectingStartDate
                      ? "Chọn ngày bắt đầu"
                      : "Chọn ngày kết thúc"}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-lg font-semibold">
                      {monthNames[currentMonth]} {currentYear}
                    </h3>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Đã chọn: {getDateRange()}
                  </div>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setSelectingStartDate(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-2 py-1 flex flex-1 items-center bg-white border border-slate-300 rounded">
            <input
              type="text"
              placeholder="Tìm kiếm theo ID người dùng..."
              onChange={(e) => setIdSearch(e.target.value)}
              className="w-full outline-none text-slate-700"
            />
            <SlMagnifier size={20} className="h-full self-end flex" />
          </div>
        </div>

        {isDetailOpen && (
          <DetailTransaction
            transaction={selectedTransaction}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedTransaction(null);
            }}
          />
        )}
        {isEditOpen && (
          <TransactionModal
            categoryList={categoryList}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedTransaction(null);
            }}
            transaction={selectedTransaction}
          />
        )}

        {/* Bảng người dùng */}
        <div className="overflow-x-auto bg-white border-slate-300 rounded shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-100">
              <tr className="3xl:text-base">
                <th className="p-3">Tên</th>
                <th className="p-3 hidden lg:table-cell">Email</th>
                <th className="p-3 ">Loại</th>
                <th className="p-3">Số tiền</th>
                <th className="p-3 hidden lg:table-cell">Danh mục</th>
                <th className="p-3 ">Ngày</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleDetail(tx)}
                  className="border-t hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <td className="p-3 font-semibold">{tx.user.name}</td>
                  <td className="p-3 hidden lg:table-cell">{tx.user.email}</td>
                  <td className="p-3">{t(tx.type)}</td>
                  <td className="p-3">
                    <span
                      className={`
                        px-3 py-1 rounded-full text-xs 
                      `}
                    >
                      {tx.amount}
                    </span>
                  </td>
                  <td className="p-3 ">
                    <span
                      className={`px-3 py-1 rounded-full text-xs hidden lg:table-cell`}
                    >
                      {t(`categories.${tx.category}`)}
                    </span>
                  </td>
                  <td className="p-3 ">{formatDateToString(tx.date)}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="
                        p-1 text-blue-500 hover:bg-blue-100 cursor-pointer transition-all border border-blue-300 rounded lg:text-base 3xl:text-base
                    "
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => handleOpenConfirmModal(e, tx)}
                      className="
                        p-1 text-red-500 hover:bg-red-100 cursor-pointer transition-all border border-red-300 rounded lg:text-base 3xl:text-base
                    "
                    >
                      <FaRegTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isConfirmModalOpen && selectedTransaction && (
            <ConfirmModal
              isOpen={isConfirmModalOpen}
              onClose={() => {
                if (!isDeleting) setIsConfirmModalOpen(false);
              }}
              onConfirm={handleConfirmDelete} // Hàm xử lý xóa
              isLoading={isDeleting} // State loading
              // Cấu hình hiển thị
              title="Xóa giao dịch này?"
              message={`Bạn có chắc chắn muốn xóa giao dịch ${
                selectedTransaction.amount
              } của user ${selectedTransaction.user?.name || "này"}?`}
              variant="danger" // Màu đỏ cảnh báo
              confirmText="Xóa bỏ"
              requireReason={true} // Admin xóa cần nhập lý do
            />
          )}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
};

export default AdminTransaction;
