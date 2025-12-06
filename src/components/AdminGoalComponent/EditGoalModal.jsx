import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Calendar, DollarSign, Activity, Save } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const EditGoalModal = ({ goal, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    targetBaseAmount: 0,
    currentBaseAmount: 0,
    status: "in_progress",
    deadline: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load data vào form khi mở modal
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || "",
        targetBaseAmount: goal.targetBaseAmount || 0,
        currentBaseAmount: goal.currentBaseAmount || 0,
        status: goal.status || "in_progress",
        deadline: goal.targetDate ? goal.targetDate.split("T")[0] : "",
      });
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axiosInstance.put(
        `/api/admin/goals/${goal._id}`,
        formData
      );
      toast.success("Cập nhật mục tiêu thành công!");

      // Kiểm tra cấu trúc response để trả về đúng data
      onSave(res.data.goal || res.data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Tính toán phần trăm để hiển thị preview
  const percentage = Math.min(
    Math.round(
      (formData.currentBaseAmount / (formData.targetBaseAmount || 1)) * 100
    ),
    100
  );

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal Container */}
        <motion.div
          className="bg-white dark:bg-[#1E1E24] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()} // Chặn click xuyên qua modal
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
                  ID: {goal._id}
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

          {/* BODY (Scrollable) */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form
              id="edit-goal-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#2a2a30] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ví dụ: Mua nhà, Du lịch..."
                    required
                  />
                  <Target
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>
              </div>

              {/* Grid: Số tiền */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mục tiêu (VND)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="targetBaseAmount"
                      value={formData.targetBaseAmount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#2a2a30] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <DollarSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                {/* Current Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
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
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#2a2a30] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <DollarSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                  {/* Progress Bar Mini Preview */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage >= 100 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Grid: Status & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#2a2a30] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none outline-none cursor-pointer"
                    >
                      <option value="in_progress">Đang tiến hành ⏳</option>
                      <option value="completed">Hoàn thành ✅</option>
                      <option value="failed">Thất bại ❌</option>
                    </select>
                    <Activity
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    {/* Custom Arrow for Select */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Hạn chót
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#2a2a30] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
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
              form="edit-goal-form" // Link button với form ID
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
