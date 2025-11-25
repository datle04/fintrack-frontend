import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { adminGetLogs } from "../../features/logSlice";
import Pagination from "../../components/Pagination";

// Helpers
const formatToYYYYMMDD = (date) => new Date(date).toISOString().split("T")[0];

const formatDateDisplay = (date) =>
  date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

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
  "accessed",
  "login_success",
  "login_error",
  "logout",
  "update_user",
  "delete_user",
  "viewed",
];
const METHODS = ["All", "GET", "POST", "PUT", "PATCH", "DELETE"];
const LEVELS = ["All", "info", "warning", "error", "critical"];

const AdminLog = () => {
  const dispatch = useDispatch();
  const logs = useSelector((state) => state.log.logs);
  const totalPages = useSelector((state) => state.log.totalPages);

  const [startDate, setStartDate] = useState(new Date(2025, 7, 1));
  const [endDate, setEndDate] = useState(new Date(2025, 7, 31));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const filter = useMemo(
    () => ({
      action: selectedAction === "All" ? "" : selectedAction.toLowerCase(),
      method: selectedMethod === "All" ? "" : selectedMethod,
      level: selectedLevel === "All" ? "" : selectedLevel,
      startDate: formatToYYYYMMDD(startDate),
      endDate: formatToYYYYMMDD(endDate),
    }),
    [selectedAction, selectedMethod, selectedLevel, startDate, endDate]
  );

  const datePickerRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [selectedAction, selectedMethod, selectedLevel, startDate, endDate]);

  useEffect(() => {
    dispatch(adminGetLogs({ ...filter, page }));
  }, [filter, page, dispatch]);

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
    `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

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
      setShowDatePicker(false);
      setSelectingStartDate(true);
    }
  };

  const renderCalendar = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const selected =
        date.getTime() === startDate.getTime() ||
        date.getTime() === endDate.getTime();
      const inRange = date >= startDate && date <= endDate;
      const today = date.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors ${
            selected
              ? "bg-blue-500 text-white"
              : inRange
              ? "bg-blue-100 text-blue-700"
              : today
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

  return (
    <div className="p-4 bg-blue-50 min-h-screen">
      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {/* Action */}
        <select
          value={filter.action}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="bg-white border rounded px-2 py-1"
        >
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a === "All" ? "Tất cả hành động" : a}
            </option>
          ))}
        </select>

        {/* Method */}
        <select
          value={filter.method}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="bg-white border rounded px-2 py-1"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m === "All" ? "Tất cả method" : m}
            </option>
          ))}
        </select>

        {/* Level */}
        <select
          value={filter.level}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="bg-white border rounded px-2 py-1"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l === "All" ? "Tất cả level" : l}
            </option>
          ))}
        </select>

        {/* Date range picker */}
        <div className="relative lg:max-w-xs flex-1" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-sm text-left"
          >
            {getDateRangeDisplay()}
          </button>
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          {showDatePicker && (
            <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-lg z-50 p-4 w-80">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {selectingStartDate
                    ? "Chọn ngày bắt đầu"
                    : "Chọn ngày kết thúc"}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <button onClick={() => handleMonthChange("prev")}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button onClick={() => handleMonthChange("next")}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((d) => (
                    <div
                      key={d}
                      className="text-xs text-center font-medium text-gray-500"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                <div className="flex justify-between items-center pt-3 border-t mt-2">
                  <span className="text-xs text-gray-500">
                    {getDateRangeDisplay()}
                  </span>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    onClick={() => {
                      setShowDatePicker(false);
                      setSelectingStartDate(true);
                    }}
                  >
                    Xong
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded border">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-2 text-left">Thời gian</th>
              <th className="p-2 text-left">Hành động</th>
              <th className="p-2 text-left">Method</th>
              <th className="p-2 text-left">Endpoint</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">User</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(
              ({
                _id,
                action,
                method,
                endpoint,
                statusCode,
                level,
                timestamp,
                userId,
              }) => (
                <tr key={_id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-2 text-gray-600 whitespace-nowrap">
                    {format(new Date(timestamp), "dd/MM/yyyy")}
                    <br />
                    <span className="text-xs text-gray-400">
                      {format(new Date(timestamp), "HH:mm:ss")}
                    </span>
                  </td>
                  <td className="p-2 capitalize whitespace-nowrap flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${getLevelDot(level)}`}
                    />
                    {getAction(action)}
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 text-xs rounded font-mono bg-gray-200 text-gray-800">
                      {method}
                    </span>
                  </td>
                  <td
                    className="p-2 max-w-[300px] truncate text-blue-500"
                    title={endpoint}
                  >
                    {endpoint}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusClass(
                        statusCode
                      )}`}
                    >
                      {statusCode}
                    </span>
                  </td>
                  <td
                    className="p-2 text-gray-700 font-mono text-xs"
                    title={userId}
                  >
                    {userId ? (
                      `${userId.slice(0, 6)}...${userId.slice(-4)}`
                    ) : (
                      <span className="text-gray-400 italic">Không có</span>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default AdminLog;
