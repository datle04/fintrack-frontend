// components/chatbot/WidgetRenderer.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle, TrendingUp, List } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const WidgetRenderer = ({ intent, data }) => {
  if (!data) return null;

  switch (intent) {
    // 1. HIỂN THỊ DANH SÁCH (List Transactions / Recurring)
    case "list_transactions":
    case "list_recurring":
    case "list_overspent_budgets":
    case "list_saving_goals":
      const list = data.transactions || data.overspentList || data || [];
      if (!Array.isArray(list) || list.length === 0) return null;

      return (
        <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-sm">
          {list.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
            >
              <span className="font-medium truncate w-2/3">
                {item.category || item.name || item.categoryName}
              </span>
              <span
                className={`font-bold ${
                  item.type === "income" ? "text-green-500" : "text-red-500"
                }`}
              >
                {/* Xử lý hiển thị số tiền tùy vào cấu trúc data của từng intent */}
                {(
                  item.amount ||
                  item.overAmount ||
                  item.targetAmount ||
                  0
                ).toLocaleString()}{" "}
                {item.currency || "VND"}
              </span>
            </div>
          ))}
          {list.length > 5 && (
            <div className="text-center text-xs text-gray-500 mt-2">
              Xem thêm trong ứng dụng...
            </div>
          )}
        </div>
      );

    // 2. HIỂN THỊ BIỂU ĐỒ TRÒN (Category Stats)
    case "spending_by_category":
    case "top_spending_category":
    case "top_income_category":
      const stats = data.stats || data.all || [];
      if (stats.length === 0) return null;

      return (
        <div className="h-48 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats}
                dataKey="displayAmount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
              >
                {stats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );

    // 3. HIỂN THỊ BIỂU ĐỒ CỘT (Trend)
    case "spending_trend":
    case "income_trend":
      const trendData = data.trend || [];
      return (
        <div className="h-40 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    // 4. THẺ XÁC NHẬN (Add Transaction/Budget/Goal)
    case "add_transaction":
    case "add_budget":
    case "add_goal":
      return (
        <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-green-800 dark:text-green-300">
              Thành công
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">
              Dữ liệu đã được cập nhật vào hệ thống.
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default WidgetRenderer;
