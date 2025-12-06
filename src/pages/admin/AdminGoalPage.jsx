import React, { useState, useEffect, useCallback } from "react";
// Giả sử bạn dùng axiosInstance đã cấu hình
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaCalculator, FaTimes } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";
import formatDateToString from "../../utils/formatDateToString";
import { merge } from "lodash";
import ConfirmModal from "../../components/ConfirmModal";
import EditGoalModal from "../../components/AdminGoalComponent/EditGoalModal";

// Component Progress Bar
const ProgressBar = ({ current, target }) => {
  const percentage = Math.min(Math.max((current / target) * 100, 0), 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

// --- Component Trang Chính ---
const AdminGoalPage = () => {
  const [goals, setGoals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // State cho Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // 👉 STATE CHO CONFIRM MODAL (MỚI)
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    type: null, // 'delete' | 'recalculate'
    data: null, // goal object
  });
  const [isProcessing, setIsProcessing] = useState(false); // Loading state cho API action

  // Hàm gọi API
  const fetchGoals = useCallback(async (currentPage) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/goals", {
        params: { page: currentPage, limit: 10 },
      });
      setGoals(res.data.goals);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
    } catch (err) {
      toast.error("Không thể tải danh sách mục tiêu!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals(page);
  }, [page, fetchGoals]);

  // --- Các Hàm Helper Update State Local ---
  const updateGoalInList = (updatedGoal) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g._id !== updatedGoal._id) return g;
        // Merge data mới vào cũ để tránh mất thông tin populate (user)
        return { ...g, ...updatedGoal, userId: g.userId };
      })
    );
  };

  const removeGoalFromList = (goalId) => {
    setGoals((prev) => prev.filter((g) => g._id !== goalId));
  };

  // --- Handlers Mở Modal ---
  const handleEditClick = (goal) => {
    setSelectedGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (goal) => {
    // Mở ConfirmModal thay vì toast custom
    setConfirmConfig({ isOpen: true, type: "delete", data: goal });
  };

  const handleRecalculateClick = (goal) => {
    // Mở ConfirmModal cho tính toán (để tránh click nhầm)
    setConfirmConfig({ isOpen: true, type: "recalculate", data: goal });
  };

  // --- 🔥 HÀM XỬ LÝ LOGIC CHUNG CHO CONFIRM MODAL ---
  const handleConfirmAction = async (reason) => {
    const { type, data } = confirmConfig;
    if (!data) return;

    setIsProcessing(true); // Bật loading spinner

    try {
      if (type === "delete") {
        // Gọi API Xóa
        await axiosInstance.delete(`/api/admin/goals/${data._id}`);
        removeGoalFromList(data._id);
        toast.success("Đã xóa mục tiêu thành công!");
      } else if (type === "recalculate") {
        // Gọi API Tính toán lại
        const res = await axiosInstance.post(
          `/api/admin/goals/${data._id}/recalculate`
        );
        // Giả sử API trả về { goal: ... }
        updateGoalInList(res.data.goal || res.data);
        toast.success("Đã tính toán lại tiến độ!");
      }

      // Đóng modal sau khi xong
      setConfirmConfig({ isOpen: false, type: null, data: null });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setIsProcessing(false); // Tắt loading spinner
    }
  };

  // --- Cấu hình nội dung Modal ---
  const getConfirmModalProps = () => {
    const { type, data } = confirmConfig;
    if (!data) return {};

    if (type === "delete") {
      return {
        title: "Xóa Mục Tiêu?",
        message: `Bạn có chắc chắn muốn xóa mục tiêu "${data.name}" của user ${
          data.userId?.name || "này"
        }? Hành động này không thể hoàn tác.`,
        variant: "danger",
        confirmText: "Xóa bỏ",
        requireReason: true, // Admin xóa cần lý do (tuỳ chọn)
      };
    }
    if (type === "recalculate") {
      return {
        title: "Tính toán lại tiến độ?",
        message: `Hệ thống sẽ quét lại toàn bộ giao dịch để cập nhật số tiền hiện tại cho mục tiêu "${data.name}".`,
        variant: "info", // Hoặc warning
        confirmText: "Tính toán",
        requireReason: false,
      };
    }
    return {};
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý Mục tiêu
      </h1>

      {loading ? (
        <div className="flex justify-center p-10">
          <span className="loading-spinner">Loading...</span>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên mục tiêu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiến độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hạn chót
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {goals.map((goal) => (
                <tr key={goal._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {goal.userId?.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {goal.userId?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {goal.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                    <div className="text-sm text-gray-900 mb-1">
                      {formatCurrency(goal.currentBaseAmount)} /{" "}
                      {formatCurrency(goal.targetBaseAmount)}
                    </div>
                    <ProgressBar
                      current={goal.currentBaseAmount}
                      target={goal.targetBaseAmount}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          goal.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : goal.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {goal.status || "in_progress"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(goal.targetDate || goal.deadline)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleRecalculateClick(goal)}
                      className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-full transition-colors"
                      title="Tính toán lại"
                    >
                      <FaCalculator />
                    </button>
                    <button
                      onClick={() => handleEditClick(goal)}
                      className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(goal)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (Giữ nguyên logic cũ) */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Trang trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>

      {/* --- MODAL EDIT (Form riêng) --- */}
      {isEditModalOpen && selectedGoal && (
        <EditGoalModal
          goal={selectedGoal}
          onClose={() => setIsEditModalOpen(false)}
          onSave={updateGoalInList}
        />
      )}

      {/* --- 🔥 MODAL CONFIRM (Xóa & Recalculate) --- */}
      {confirmConfig.isOpen && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => {
            if (!isProcessing)
              setConfirmConfig({ ...confirmConfig, isOpen: false });
          }}
          onConfirm={handleConfirmAction} // Gọi hàm xử lý chung
          isLoading={isProcessing} // State loading
          {...getConfirmModalProps()} // Spread props (Title, Message, Variant)
        />
      )}
    </div>
  );
};

export default AdminGoalPage;
