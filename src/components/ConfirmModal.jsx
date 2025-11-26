import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Ban, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  adminBanUser,
  adminDeleteUser,
  adminUnbanUser,
} from "../features/userSlice";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { adminDeleteTransaction } from "../features/transactionSlice";
import { deleteAdminBudget } from "../features/adminBudgetSlice";

const ConfirmModal = ({
  modalType,
  isOpen,
  onClose,
  onConfirm,
  type,
  user = null,
  transaction = null,
  budget = null,
}) => {
  const dispatch = useDispatch();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const modalText = {
    ban: {
      title: "Cấm người dùng này?",
      message: `Bạn có chắc chắn muốn cấm ${user?.name || "người dùng"} không?`,
      icon: <Ban className="text-orange-500 w-10 h-10" />,
      confirmText: "Cấm",
      confirmColor: "bg-red-600 hover:bg-red-700",
    },
    delete: {
      title: "Xóa mục này",
      message: `Bạn có chắc chắn muốn xóa ${
        modalType === "user" ? user?.name : "mục"
      } này không?`,
      icon: <Trash2 className="text-red-500 w-10 h-10" />,
      confirmText: "Xóa",
      confirmColor: "bg-red-600 hover:bg-red-700",
    },
    unban: {
      title: "Gỡ cấm người dùng này?",
      message: `Bạn có chắc chắn muốn gỡ bỏ lệnh cấm ${
        user?.name || "người dùng"
      } không?`,
      icon: <FaUnlockKeyhole className="text-green-500 w-10 h-10" />,
      confirmText: "Gỡ cấm",
      confirmColor: "bg-green-600 hover:bg-green-700",
    },
    default: {
      title: "Xác nhận hành động",
      message: "Bạn có chắc chắn muốn thực hiện hành động này không?",
      icon: <AlertTriangle className="text-yellow-500 w-10 h-10" />,
      confirmText: "Xác nhận",
      confirmColor: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const content = modalText[type] || modalText.default;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm(reason); // Truyền reason nếu cần
      onClose();
      return;
    }
    if (type === "ban" && !reason.trim()) {
      setError("Vui lòng nhập lý do trước khi xác nhận!");
      toast.error("Thiếu lý do!");
      return;
    }

    if (type === "ban") {
      const action = dispatch(adminBanUser({ id: user._id, reason }));

      await toast.promise(action.unwrap(), {
        loading: "Đang cấm người dùng...",
        success: "Cấm người dùng thành công!",
        error: (err) => err?.message || "Có lỗi xảy ra khi cấm người dùng!",
      });

      onClose(); // đóng modal luôn cho gọn
    }

    if (type === "delete" && modalType === "user") {
      // ví dụ nếu bạn có action delete
      const action = dispatch(adminDeleteUser({ id: user._id, reason }));

      await toast.promise(action.unwrap(), {
        loading: "Đang xóa người dùng...",
        success: "Đã xóa người dùng thành công!",
        error: (err) => err?.message || "Có lỗi xảy ra khi xóa người dùng!",
      });

      onClose();
    }

    if (type === "delete" && modalType === "budget") {
      // ví dụ nếu bạn có action delete
      const action = dispatch(
        deleteAdminBudget({ budgetId: budget._id, reason })
      );

      await toast.promise(action.unwrap(), {
        loading: "Đang xóa ngân sách...",
        success: "Đã xóa ngân sách thành công!",
        error: (err) => err?.message || "Có lỗi xảy ra khi xóa ngân sách!",
      });

      onClose();
    }

    if (type === "delete" && modalType === "transaction") {
      const action = dispatch(
        adminDeleteTransaction({ id: transaction._id, reason })
      );
    }

    if (type === "unban") {
      // ví dụ nếu bạn có action delete
      const action = dispatch(adminUnbanUser(user._id));

      await toast.promise(action.unwrap(), {
        loading: "Đang gỡ cấm người dùng...",
        success: "Đã gỡ cấm người dùng thành công!",
        error: (err) => err?.message || "Có lỗi xảy ra khi gỡ cấm người dùng!",
      });

      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {content.icon}
              <h2 className="text-lg font-semibold">{content.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {content.message}
              </p>

              {/* Chỉ hiển thị ô nhập Lý do khi: 
                  1. KHÔNG có onConfirm (tức là Admin đang thao tác)
                  2. VÀ loại modal là "ban" HOẶC "delete" 
              */}
              {!onConfirm && (type === "ban" || type === "delete") && (
                <div className="w-full text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lý do:
                  </label>
                  <textarea
                    className={`w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 ${
                      error
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                    rows={3}
                    placeholder="Nhập lý do..."
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (error) setError("");
                    }}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg text-white ${content.confirmColor}`}
                >
                  {content.confirmText}
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
