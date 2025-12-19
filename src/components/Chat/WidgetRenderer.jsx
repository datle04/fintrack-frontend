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
import {
  CheckCircle,
  TrendingUp,
  List,
  CreditCard,
  Trash2,
  Repeat,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { useTranslation } from "react-i18next";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const DeletedTransactionCard = ({ data }) => {
  return (
    <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-red-600 font-medium text-sm">
        <Trash2 size={16} />
        <span>Đã xóa giao dịch</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-xs uppercase tracking-wide">
            {data.category?.name || data.category || "Khác"}
          </p>
          <p className="text-gray-900 font-bold text-lg line-through opacity-70">
            {formatCurrency(data.amount, data.currency || "VND")}
          </p>
          {data.note && (
            <p className="text-gray-500 text-xs italic mt-1">"{data.note}"</p>
          )}
        </div>
        <div className="text-xs text-gray-400 text-right">
          {new Date(data.date).toLocaleDateString("vi-VN")}
        </div>
      </div>
    </div>
  );
};

const CancelledRecurringCard = ({ data }) => {
  return (
    <div className="mt-2 bg-orange-50 border border-orange-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-orange-600 font-medium text-sm">
        <Repeat size={16} />
        <span>Đã hủy gia hạn</span>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-base">
            {data.note || "Gói không tên"}
          </h4>
          <p className="text-gray-600 text-sm mt-0.5">
            {formatCurrency(data.amount, data.currency || "VND")} / kỳ
          </p>
          <p className="text-xs text-orange-400 mt-2">
            *Các giao dịch trong quá khứ vẫn được giữ lại.
          </p>
        </div>
      </div>
    </div>
  );
};

const WidgetRenderer = ({ intent, data }) => {
  if (!data) return null;

  const { t, i18n } = useTranslation();

  switch (intent) {
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

    case "delete_last_transaction":
      return <DeletedTransactionCard data={data} />;

    case "cancel_recurring":
      return <CancelledRecurringCard data={data} />;

    case "financial_advice":
      return (
        <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded shadow-sm">
            <p className="text-gray-500">Tổng Thu</p>
            <p className="text-green-600 font-bold text-sm">
              {formatCurrency(data.income)}
            </p>
          </div>
          <div className="bg-white p-2 rounded shadow-sm">
            <p className="text-gray-500">Tổng Chi</p>
            <p className="text-red-600 font-bold text-sm">
              {formatCurrency(data.expense)}
            </p>
          </div>
          <div className="col-span-2 bg-white p-2 rounded shadow-sm">
            <p className="text-gray-500 mb-1">Top chi tiêu:</p>
            <div className="flex gap-2 flex-wrap">
              {data.topSpending.map((item, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 px-2 py-0.5 rounded text-gray-700"
                >
                  {t(`categories.${item.key}`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default WidgetRenderer;
