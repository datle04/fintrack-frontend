import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { adminGetLogs } from "../../features/logSlice";
import Pagination from "../../components/Pagination";
import toast from "react-hot-toast";

const getStatusClass = (code) =>
  code < 300
    ? "bg-green-100 text-green-700"
    : code < 500
    ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700";

const getLevelDot = (level) => {
  switch (level) {
    case "info":
      return "bg-blue-500";
    case "warning":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    case "critical":
      return "bg-orange-500";
    default:
      return "bg-gray-400";
  }
};

const getAction = (str) => str.split(" ")[0];

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
const ACTIONS = [
  "All",
  "LOGIN",
  "REGISTER",
  "VIEWED",
  "CREATE",
  "UPDATE",
  "DELETE",
  "STOP",
  "EXPORT",
  "ADMIN",
  "CHANGE",
];
const METHODS = ["All", "GET", "POST", "PUT", "PATCH", "DELETE"];
const LEVELS = ["All", "info", "warning", "error", "critical"];

const AdminLog = () => {
  const dispatch = useDispatch();
  const logs = useSelector((state) => state.log.logs) || [];
  const totalPages = useSelector((state) => state.log.totalPages);
  const loading = useSelector((state) => state.log.loading);

  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)));
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingStartDate, setSelectingStartDate] = useState(true);

  // Filter State
  const [page, setPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const datePickerRef = useRef(null);

  // --- FILTER MEMO ---
  const filter = useMemo(
    () => ({
      action: selectedAction === "All" ? "" : selectedAction.toLowerCase(),
      method: selectedMethod === "All" ? "" : selectedMethod,
      level: selectedLevel === "All" ? "" : selectedLevel,
      search: searchTerm.trim(),
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    }),
    [
      selectedAction,
      selectedMethod,
      selectedLevel,
      searchTerm,
      startDate,
      endDate,
    ]
  );

  // --- EFFECT: FETCH DATA ---
  useEffect(() => {
    dispatch(adminGetLogs({ ...filter, page }));
  }, [filter, page, dispatch]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleDateSelectionComplete = () => {
    setShowDatePicker(false);
    setSelectingStartDate(true);
    setPage(1);
  };

  // --- CALENDAR LOGIC ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
        setSelectingStartDate(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDateRangeDisplay = () =>
    `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

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
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
      } else {
        setEndDate(startDate);
        setStartDate(selectedDate);
      }
      handleDateSelectionComplete();
    }
  };

  const renderCalendar = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

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
          "bg-blue-600 text-white hover:bg-blue-700 shadow-md transform scale-105";
      else if (inRange) classes = "bg-blue-50 text-blue-700";
      else if (today) classes = "text-blue-600 font-bold bg-blue-50";

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-all duration-200 ${classes}`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Nhật ký hoạt động</h1>

        {/* Search Input */}
        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm User ID, Endpoint..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm mr-2">
          <Filter size={16} />
          <span>Bộ lọc:</span>
        </div>

        {/* Select Actions */}
        <select
          value={filter.action}
          onChange={(e) =>
            handleFilterChange(setSelectedAction, e.target.value)
          }
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
        >
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a === "All" ? "Hành động: Tất cả" : a}
            </option>
          ))}
        </select>

        {/* Select Methods */}
        <select
          value={filter.method}
          onChange={(e) =>
            handleFilterChange(setSelectedMethod, e.target.value)
          }
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m === "All" ? "Method: Tất cả" : m}
            </option>
          ))}
        </select>

        {/* Select Levels */}
        <select
          value={filter.level}
          onChange={(e) => handleFilterChange(setSelectedLevel, e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l === "All" ? "Level: Tất cả" : l}
            </option>
          ))}
        </select>

        {/* Custom Date Picker Trigger */}
        <div
          className="relative flex-1 min-w-[200px] md:max-w-xs ml-auto"
          ref={datePickerRef}
        >
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm text-gray-700 font-medium"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
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
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
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

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton Loading
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-10"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-gray-300" />
                      <p>Không tìm thấy dữ liệu log phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {format(new Date(log.timestamp), "dd/MM/yyyy")}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(log.timestamp), "HH:mm:ss")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${getLevelDot(
                            log.level
                          )}`}
                        />
                        <span className="font-medium text-gray-700 capitalize">
                          {getAction(log.action)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-[11px] font-bold font-mono rounded border ${
                          log.method === "GET"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : log.method === "POST"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : log.method === "DELETE"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-gray-50 text-gray-600 border-gray-100"
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="p-4">
                      <div
                        className="max-w-[200px] truncate text-gray-600 font-mono text-xs bg-gray-50 px-2 py-1 rounded"
                        title={log.endpoint}
                      >
                        {log.endpoint}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${getStatusClass(
                          log.statusCode
                        ).replace("bg-", "bg-opacity-10 border-")}`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="p-4">
                      {log.userId ? (
                        <span
                          onClick={() => {
                            navigator.clipboard.writeText(log.userId);
                            toast.success("Đã copy User ID vào clipboard!");
                          }}
                          className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100 hover:text-blue-600 transition-colors select-none"
                          title="Click để copy toàn bộ User ID"
                        >
                          {log.userId.slice(-6)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 italic">
                          Guest
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default AdminLog;
