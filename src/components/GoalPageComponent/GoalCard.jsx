import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Target,
  HandHeart,
} from "lucide-react";
import InfoItem from "./InfoItem";
import SavingsRec from "./SavingsRec";
import { formatCurrency } from "../../utils/formatCurrency";
import dayjs from "dayjs";
import TransactionModal from "../TransactionModal";

// --- Goal Card Component ---
const GoalCard = ({
  goal,
  onEdit,
  onDelete,
  onComplete,
  t,
  i18n,
  onContribute,
  //   isTransactionModalOpen,
  //   setIsTransactionModalOpen,
}) => {
  const progressPercent = goal.progressPercent || 0;
  const remainingAmount = goal.displayRemainingAmount || 0; // Lấy từ Backend
  const { savingsPlan } = goal; // <-- Lấy kế hoạch tiết kiệm

  const isCompleted = goal.isCompleted || progressPercent >= 100;
  const daysRemaining = savingsPlan?.daysRemaining || 0; // Lấy từ Backend
  const isOverdue = daysRemaining < 0 && !isCompleted;

  let progressColor = "#6c2bd9";
  if (progressPercent >= 100) progressColor = "#10b981";
  else if (isOverdue) progressColor = "#ef4444";

  const progressStyle = buildStyles({
    pathColor: progressColor,
    trailColor: "#e6e6fa",
    textColor: progressColor,
    strokeLinecap: "round",
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 dark:bg-[#2E2E33] dark:text-white/83 dark:border-slate-700 relative">
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
          isCompleted
            ? "bg-green-500"
            : isOverdue
            ? "bg-red-500"
            : "bg-indigo-500"
        }`}
      />

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold dark:text-white/90 truncate max-w-[200px]">
            {goal.name}
          </h3>
          <p
            className={`text-sm font-medium mt-1 ${
              isCompleted
                ? "text-green-600"
                : isOverdue
                ? "text-red-600"
                : "text-indigo-600"
            }`}
          >
            <span className="mr-1">•</span>
            {isCompleted
              ? t("completed")
              : isOverdue
              ? t("overdue") || "Quá hạn"
              : t("inProgress")}
          </p>
        </div>
        <div className="w-16 h-16 ml-4">
          <CircularProgressbar
            value={progressPercent}
            text={`${progressPercent.toFixed(0)}%`}
            styles={progressStyle}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm font-medium">
        <InfoItem
          label={t("targetAmount")}
          value={`${formatCurrency(
            goal.targetOriginalAmount,
            goal.targetCurrency,
            i18n.language
          )}`}
        />
        <InfoItem
          label={t("currentAmount")}
          value={`${formatCurrency(
            goal.displayCurrentAmount,
            goal.targetCurrency,
            i18n.language
          )}`}
          colorClass="text-green-500 dark:text-green-400"
        />
        <InfoItem
          label={t("remaining")}
          value={`${formatCurrency(
            goal.displayRemainingAmount,
            goal.targetCurrency,
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
          value={dayjs(goal.targetDate).format("DD/MM/YYYY")}
        />
      </div>

      {/* ⚠️ KHU VỰC ĐẶC BIỆT: KẾ HOẠCH TIẾT KIỆM KHUYẾN NGHỊ */}
      {!isCompleted && remainingAmount > 0 && daysRemaining > 0 && (
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
              currency={goal.targetCurrency}
            />
            <SavingsRec
              period={t("weekly")}
              amount={savingsPlan.recommendedWeekly}
              t={t}
              i18n={i18n}
              currency={goal.targetCurrency}
            />
            <SavingsRec
              period={t("monthly")}
              amount={savingsPlan.recommendedMonthly}
              t={t}
              i18n={i18n}
              currency={goal.targetCurrency}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6 border-t pt-4 dark:border-slate-700">
        <button
          onClick={onContribute}
          title={t("contribute")}
          className={`p-1 rounded-full transition-all cursor-pointer text-red-500 hover:bg-red-100`}
        >
          <HandHeart size={25} />
        </button>
        <button
          onClick={onComplete}
          title={
            isCompleted ? "Đánh dấu đang tiến hành" : "Đánh dấu hoàn thành"
          }
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isCompleted
              ? "text-gray-500 hover:bg-gray-100"
              : "text-green-500 hover:bg-green-100"
          }`}
        >
          <CheckCircle size={20} />
        </button>
        <button
          onClick={onEdit}
          title="Chỉnh sửa mục tiêu"
          className="p-2 text-blue-500 rounded-full cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <Edit size={20} />
        </button>
        <button
          onClick={onDelete}
          title="Xóa mục tiêu"
          className="p-2 text-red-500 rounded-full cursor-pointer hover:bg-red-100 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
