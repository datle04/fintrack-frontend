import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const RecentErrorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          "/api/admin/dashboard/recent-errors",
          {
            params: { limit: 5 },
          }
        );
        setLogs(res.data);
      } catch (err) {
        console.error("Lỗi khi tải log lỗi:", err);
        setError("Không thể tải log lỗi.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500 text-center">Đang tải log...</p>;
    }

    if (error) {
      return <p className="text-red-500 text-center">{error}</p>;
    }

    if (logs.length === 0) {
      return (
        <div className="text-center text-green-600">
          <p>✅ Không có lỗi nào gần đây. Hệ thống ổn định!</p>
        </div>
      );
    }

    return (
      <ul className="divide-y divide-gray-200">
        {logs.map((log) => (
          <li key={log._id} className="py-3">
            <p className="text-sm font-medium text-red-600 truncate">
              {log.action}
            </p>
            <p className="text-xs text-gray-700 truncate">{log.description}</p>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{log.user ? log.user.name : "Hệ thống"}</span>
              <span>
                {formatDistanceToNow(new Date(log.timestamp), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-6 border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Log Lỗi Gần Đây</h2>
        <Link
          to="/admin/logs"
          className="text-sm text-blue-600 hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="h-[360px] overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

export default RecentErrorLogs;
