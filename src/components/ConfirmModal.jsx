import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Ban, Trash2, XCircle, CheckCircle } from "lucide-react";
import { FaUnlockKeyhole } from "react-icons/fa6";

// Định nghĩa các biến thể giao diện (Variant) để dễ tái sử dụng
const VARIANTS = {
  danger: {
    icon: <Trash2 className="text-red-500 w-12 h-12" />,
    confirmClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  },
  warning: {
    icon: <AlertTriangle className="text-orange-500 w-12 h-12" />,
    confirmClass: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
  },
  success: {
    icon: <CheckCircle className="text-green-500 w-12 h-12" />,
    confirmClass: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  },
  info: {
    icon: <AlertTriangle className="text-blue-500 w-12 h-12" />, // Dùng tạm icon alert hoặc thay icon info
    confirmClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  },
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm, // Hàm xử lý logic (Promise)
  title, // Tiêu đề tùy chỉnh
  message, // Nội dung tùy chỉnh
  variant = "danger", // 'danger' | 'warning' | 'success' | 'info'
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  requireReason = false, // Có bắt buộc nhập lý do không?
  isLoading = false, // Trạng thái loading từ bên ngoài truyền vào (hoặc tự xử lý)
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // Reset state khi mở/đóng modal
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError("Vui lòng nhập lý do để tiếp tục.");
      return;
    }

    // Gọi hàm onConfirm từ cha, truyền kèm reason
    if (onConfirm) {
      await onConfirm(reason);
    }
  };

  const style = VARIANTS[variant] || VARIANTS.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined} // Chặn click overlay khi đang loading
          />

          {/* Modal Content */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1E1E24] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700"
            initial={{ scale: 0.95, opacity: 0, y: "-40%" }}
            animate={{ scale: 1, opacity: 1, y: "-50%" }}
            exit={{ scale: 0.95, opacity: 0, y: "-40%" }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon Wrapper với animation nhẹ */}
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-full">
                {style.icon}
              </div>

              <div className="space-y-2 w-full">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Input Reason Area */}
              {requireReason && (
                <div className="w-full text-left animate-fade-in-up">
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                    Lý do
                  </label>
                  <textarea
                    className={`w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-[#2a2a30] dark:text-white dark:border-slate-600 outline-none transition-all focus:ring-2 ${
                      error
                        ? "border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10"
                        : "focus:ring-indigo-500 border-gray-200"
                    }`}
                    rows={3}
                    placeholder="Nhập lý do chi tiết..."
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {error}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2.5 rounded-xl font-medium text-white shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${style.confirmClass}`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
