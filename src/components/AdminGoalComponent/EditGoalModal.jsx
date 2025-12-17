import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  Calendar,
  DollarSign,
  Activity,
  Save,
  MessageSquare,
  FileText, // Icon cho description
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
// 👇 Import hàm tiện ích
import { getDirtyValues } from "../../utils/formUtils";

const EditGoalModal = ({ goal, onClose, onSave }) => {
  // 1️⃣ State lưu giá trị gốc để so sánh
  const [initialValues, setInitialValues] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "", // 👇 Thêm trường này vì Backend cho phép sửa
    targetBaseAmount: 0,
    currentBaseAmount: 0,
    status: "in_progress",
    deadline: "",
    reason: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load data vào form khi mở modal
  useEffect(() => {
    if (goal) {
      const initData = {
        name: goal.name || "",
        description: goal.description || "",
        targetBaseAmount: goal.targetBaseAmount || 0,
        currentBaseAmount: goal.currentBaseAmount || 0,
        status: goal.status || "in_progress",
        deadline: goal.targetDate ? goal.targetDate.split("T")[0] : "",
        // Reason không nằm trong initialValues vì nó là input mới mỗi lần sửa
      };

      setInitialValues(initData);
      setFormData({ ...initData, reason: "" });
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2️⃣ Validate bắt buộc nhập lý do
    if (!formData.reason.trim()) {
      toast.error("Vui lòng nhập lý do chỉnh sửa!");
      return;
    }

    // 3️⃣ Sử dụng getDirtyValues để lấy các trường thay đổi
    // (Lưu ý: reason không nằm trong initialValues nên ta xử lý riêng)
    const { reason, ...currentDataWithoutReason } = formData;
    const dirtyFields = getDirtyValues(initialValues, currentDataWithoutReason);

    // Kiểm tra xem có thay đổi gì về dữ liệu (Name/Description) không?
    if (Object.keys(dirtyFields).length === 0) {
      toast.info("Bạn chưa thay đổi thông tin nào (Tên hoặc Mô tả)!");
      return;
    }

    // 4️⃣ Chuẩn bị payload: Chỉ gửi field thay đổi + reason
    const payload = {
      ...dirtyFields,
      reason: formData.reason,
    };

    setIsLoading(true);

    try {
      const res = await axiosInstance.patch(
        `/api/admin/goals/${goal._id}`,
        payload
      );
      toast.success("Cập nhật mục tiêu thành công!");

      onSave(res.data.goal || res.data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const percentage = Math.min(
    Math.round(
      (formData.currentBaseAmount / (formData.targetBaseAmount || 1)) * 100
    ),
    100
  );

  // Style cho input bị disabled (Read-only)
  const disabledInputClass =
    "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-70";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-[#1E1E24] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  Chỉnh sửa Mục tiêu
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {goal?._id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form
              id="edit-goal-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* 🟢 NHÓM EDITABLE: Được phép sửa */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 space-y-4">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Thông tin chung (Được phép sửa)
                </h3>

                {/* Field: Tên Mục Tiêu */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tên mục tiêu
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#2a2a30] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <Target
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                {/* Field: Mô tả (Mới thêm) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mô tả
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#2a2a30] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Mô tả chi tiết..."
                    />
                    <FileText
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              {/* 🔴 NHÓM READ-ONLY: Không được sửa */}
              <div className="space-y-6 opacity-80">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  Dữ liệu tài chính (Chỉ xem)
                </h3>

                {/* Grid: Số tiền */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500">
                      Mục tiêu (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="targetBaseAmount"
                        value={formData.targetBaseAmount}
                        disabled // 🚫 DISABLED
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 outline-none ${disabledInputClass}`}
                      />
                      <DollarSign
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500 flex justify-between">
                      <span>Hiện tại (VND)</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          percentage >= 100
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="currentBaseAmount"
                        value={formData.currentBaseAmount}
                        disabled // 🚫 DISABLED
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 outline-none ${disabledInputClass}`}
                      />
                      <DollarSign
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percentage >= 100 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Grid: Status & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500">
                      Trạng thái
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        value={formData.status}
                        disabled // 🚫 DISABLED
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 appearance-none outline-none ${disabledInputClass}`}
                      >
                        <option value="in_progress">Đang tiến hành ⏳</option>
                        <option value="completed">Hoàn thành ✅</option>
                        <option value="failed">Thất bại ❌</option>
                      </select>
                      <Activity
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500">
                      Hạn chót
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        disabled // 🚫 DISABLED
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 outline-none ${disabledInputClass}`}
                      />
                      <Calendar
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* REQUIRED REASON */}
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Lý do chỉnh sửa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    name="reason"
                    rows="3"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none placeholder-gray-400"
                    placeholder="Bắt buộc: Nhập lý do thay đổi tên hoặc mô tả..."
                    required
                  />
                  <MessageSquare
                    className="absolute left-3 top-4 text-gray-400"
                    size={18}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="edit-goal-form"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditGoalModal;
