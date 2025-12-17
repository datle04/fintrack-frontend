import React from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/formatCurrency";
import {
  X,
  Calendar,
  FileText,
  Tag,
  ArrowUpCircle,
  ArrowDownCircle,
  Image as ImageIcon,
  Repeat,
} from "lucide-react"; // Import icons

const DetailTransaction = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const { t, i18n } = useTranslation();

  // Logic xác định màu sắc và icon dựa trên loại giao dịch
  const isExpense = transaction.type === "expense";
  const themeColor = isExpense ? "red" : "green";
  const TypeIcon = isExpense ? ArrowDownCircle : ArrowUpCircle;

  // Format ngày hiển thị
  const displayDate = transaction.isRecurring
    ? `${t("recurringDay")} ${transaction.recurringDay}`
    : new Date(transaction.date).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E1E24] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER: Close Button */}
        <div className="flex justify-end p-4 absolute top-0 right-0 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full text-gray-500 dark:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* HERO SECTION: Số tiền & Loại */}
        <div
          className={`pt-10 pb-8 px-6 text-center ${
            isExpense
              ? "bg-red-50 dark:bg-red-900/20"
              : "bg-green-50 dark:bg-green-900/20"
          }`}
        >
          <div className="flex justify-center mb-3">
            <div
              className={`p-3 rounded-full ${
                isExpense
                  ? "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200"
                  : "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200"
              }`}
            >
              <TypeIcon size={32} strokeWidth={2} />
            </div>
          </div>

          <h2
            className={`text-3xl font-bold mb-1 ${
              isExpense
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {isExpense ? "-" : "+"}
            {formatCurrency(
              transaction.amount,
              transaction.currency,
              i18n.language
            )}
          </h2>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {transaction.type === "income" ? t("income") : t("expense")}
          </p>
        </div>

        {/* BODY: Thông tin chi tiết */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-white dark:bg-[#1E1E24]">
          {/* Grid thông tin chính */}
          <div className="space-y-4">
            {/* Danh mục */}
            <DetailRow
              icon={<Tag size={18} className="text-indigo-500" />}
              label={t("categoriesLabel")}
              value={t(`categories.${transaction.category}`)}
            />

            {/* Ngày tháng */}
            <DetailRow
              icon={
                transaction.isRecurring ? (
                  <Repeat size={18} className="text-orange-500" />
                ) : (
                  <Calendar size={18} className="text-blue-500" />
                )
              }
              label={
                transaction.isRecurring ? t("recurringTransaction") : t("date")
              }
              value={displayDate}
              valueClass="capitalize"
            />
          </div>

          {/* Ghi chú (Nếu có) */}
          {transaction.note && (
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <FileText size={16} />
                {t("note")}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {transaction.note}
              </p>
            </div>
          )}

          {/* Ảnh hóa đơn (Gallery) */}
          {transaction.receiptImage?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <ImageIcon size={16} />
                {t("receiptImages")} ({transaction.receiptImage.length})
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {transaction.receiptImage.map((url, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                    onClick={() => window.open(url, "_blank")}
                  >
                    <img
                      src={url}
                      alt={`Receipt ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium text-sm transition-colors shadow-sm dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/10"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component con để hiển thị từng dòng thông tin
const DetailRow = ({ icon, label, value, valueClass = "" }) => (
  <div className="flex items-start justify-between group">
    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
      <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span
      className={`text-sm font-semibold text-gray-800 dark:text-white text-right max-w-[60%] ${valueClass}`}
    >
      {value}
    </span>
  </div>
);

export default DetailTransaction;
