import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/formatCurrency";

const DetailTransaction = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const { t, i18n } = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg relative z-50 animate-fadeIn dark:bg-[#2E2E33] dark:text-white/83 dark:border dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">{t("transactionDetail")}</h2>

        <div className="space-y-4 text-sm md:text-base">
          <Info
            label={t("type")}
            value={transaction.type === "income" ? t("income") : t("expense")}
          />
          <Info
            label={t("amount")}
            value={formatCurrency(
              transaction.amount,
              transaction.currency,
              i18n.language
            )}
          />
          <Info
            label={t("categoriesLabel")}
            value={t(`categories.${transaction.category}`)}
          />
          <Info label={t("note")} value={transaction.note || "-"} />
          <Info
            label={t("date")}
            value={
              transaction.isRecurring
                ? `Giao dịch định kỳ ngày ${transaction.recurringDay} hàng tháng`
                : new Date(transaction.date).toLocaleDateString("vi-VN")
            }
          />

          {/* ✅ Hiển thị ảnh hóa đơn nếu có */}
          {transaction.receiptImage?.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("receiptImages")}
              </label>
              <div className="flex flex-grow gap-2 ">
                {transaction.receiptImage.map((url, i) => (
                  <img
                    onClick={() => window.open(url)}
                    key={i}
                    src={url}
                    alt={`${t("bill")} ${i + 1}`}
                    className="max-h-30 aspect-auto rounded border shadow hover:scale-105 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer dark:bg-gray-600 dark:hover:bg-gray-700 transition-all"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <span className="font-semibold text-gray-600 dark:text-gray-200">
      {label}:
    </span>{" "}
    <span className="text-gray-800 dark:text-white/80">{value}</span>
  </div>
);

export default DetailTransaction;
