import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import {
  Edit,
  Trash2,
  CheckCircle,
  HandHeart,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react"; // Đã bỏ import Plus, Target, TransactionModal vì không dùng
import InfoItem from "./InfoItem";
import SavingsRec from "./SavingsRec";
import { formatCurrency } from "../../utils/formatCurrency";
import dayjs from "dayjs";

// --- Goal Card Component ---
const GoalCard = ({
  goal,
  onComplete,
  onDelete,
  onEdit,
  onContribute,
  t,
  i18n,
}) => {
  // 1. Destructure các dữ liệu cần thiết từ goal
  const {
    status = "in_progress", // Mặc định là in_progress nếu thiếu
    savingsPlan,
    progressPercent = 0,
    displayRemainingAmount = 0,
    name,
    targetOriginalAmount,
    targetCurrency,
    displayCurrentAmount,
    targetDate,
  } = goal;

  // Logic hiển thị
  const isCompleted = status === "completed";
  const daysRemaining = savingsPlan?.daysRemaining || 0;
  // Quá hạn khi: chưa xong VÀ ngày còn lại <= 0
  const isOverdue = daysRemaining <= 0 && !isCompleted;

  // 2. Config màu sắc/icon cho Badge
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case "completed":
        return {
          color:
            "text-green-700 bg-green-100 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
          icon: <CheckCircle size={12} strokeWidth={2.5} />,
          label: t("completed") || "Hoàn thành",
          borderColor: "border-green-500",
        };
      case "failed":
        return {
          color:
            "text-red-700 bg-red-100 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
          icon: <XCircle size={12} strokeWidth={2.5} />,
          label: t("failed") || "Thất bại",
          borderColor: "border-red-500",
        };
      default: // in_progress
        return {
          color:
            "text-blue-700 bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
          icon: <Clock size={12} strokeWidth={2.5} />,
          label: t("inProgress") || "Đang thực hiện",
          borderColor: "border-indigo-500",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Style cho progress bar
  const progressStyle = buildStyles({
    pathColor:
      status === "completed"
        ? "#22c55e"
        : status === "failed"
        ? "#ef4444"
        : "#6366f1",
    textColor:
      status === "completed"
        ? "#22c55e"
        : status === "failed"
        ? "#ef4444"
        : "#6366f1",
    trailColor: "#e5e7eb",
    textSize: "24px",
  });

  return (
    <div
      className={`relative p-5 rounded-2xl bg-white dark:bg-[#2E2E33] shadow-sm hover:shadow-md transition-shadow border-l-4 ${statusConfig.borderColor}`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-2">
          {/* Tên Mục Tiêu */}
          <h3
            className="text-xl font-bold text-gray-800 dark:text-white/90 truncate"
            title={name}
          >
            {name}
          </h3>

          {/* BADGE TRẠNG THÁI */}
          <div className="mt-2 flex items-center">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${statusConfig.color}`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="w-14 h-14 flex-shrink-0">
          <CircularProgressbar
            value={progressPercent}
            text={`${Math.round(progressPercent)}%`}
            styles={progressStyle}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm font-medium">
        <InfoItem
          label={t("targetAmount")}
          value={`${formatCurrency(
            targetOriginalAmount,
            targetCurrency,
            i18n.language
          )}`}
        />
        <InfoItem
          label={t("currentAmount")}
          value={`${formatCurrency(
            displayCurrentAmount,
            targetCurrency,
            i18n.language
          )}`}
          colorClass="text-green-500 dark:text-green-400"
        />
        <InfoItem
          label={t("remaining")}
          value={`${formatCurrency(
            displayRemainingAmount,
            targetCurrency,
            i18n.language
          )}`}
          colorClass="text-red-500 dark:text-red-400"
        />
        <InfoItem
          label={t("remainingTime")}
          value={
            isCompleted
              ? t("completed")
              : isOverdue
              ? `${t("overdue")} ${Math.abs(daysRemaining)} ${t("days")}`
              : `${daysRemaining} ${t("days")}`
          }
          colorClass={
            isOverdue
              ? "text-red-500 dark:text-red-400"
              : "text-gray-600 dark:text-gray-400"
          }
        />
        <InfoItem
          label={t("targetDate")}
          value={dayjs(targetDate).format("DD/MM/YYYY")}
        />
      </div>

      {/* KẾ HOẠCH TIẾT KIỆM KHUYẾN NGHỊ */}
      {/* Logic hiển thị: Chưa hoàn thành VÀ còn số tiền phải đóng VÀ chưa quá hạn */}
      {!isCompleted && displayRemainingAmount > 0 && daysRemaining > 0 && (
        <div className="mt-6 pt-4 border-t border-dashed dark:border-slate-700/50">
          <h4 className="text-md font-bold mb-3 text-indigo-600 dark:text-indigo-400">
            {t("recommendedSavings") || "Gợi ý Tiết kiệm"}
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
            <SavingsRec
              period={t("daily")}
              amount={savingsPlan.recommendedDaily}
              t={t}
              i18n={i18n}
              currency={targetCurrency}
            />
            <SavingsRec
              period={t("weekly")}
              amount={savingsPlan.recommendedWeekly}
              t={t}
              i18n={i18n}
              currency={targetCurrency}
            />
            <SavingsRec
              period={t("monthly")}
              amount={savingsPlan.recommendedMonthly}
              t={t}
              i18n={i18n}
              currency={targetCurrency}
            />
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-2 mt-6 border-t pt-4 dark:border-slate-700">
        {/* Nút Đóng góp: Chỉ hiện khi Đang thực hiện */}
        {status === "in_progress" && (
          <button
            onClick={onContribute}
            title={t("contribute")}
            className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors"
          >
            <HandHeart size={18} />
          </button>
        )}

        {/* Nút Hoàn thành / Mở lại */}
        <button
          onClick={onComplete}
          // 1. Nếu Failed -> Disable nút này
          disabled={isFailed}
          title={
            isCompleted
              ? "Mở lại mục tiêu"
              : isFailed
              ? "Mục tiêu đã thất bại (Cần gia hạn để tiếp tục)"
              : "Đánh dấu hoàn thành"
          }
          className={`p-2 rounded-lg transition-colors ${
            isCompleted
              ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
              : isFailed
              ? "text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600" // Style cho Failed (Xám & Cấm)
              : "text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
          }`}
        >
          {isCompleted ? (
            <RotateCcw size={18} />
          ) : isFailed ? (
            // Icon khác biệt cho trạng thái Failed (Ví dụ: Biển cấm hoặc Xám)
            <XCircle size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
        </button>

        {/* Nút Sửa */}
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
        >
          <Edit size={18} />
        </button>

        {/* Nút Xóa */}
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
