import React, { useState, useEffect, useCallback } from "react";
// Giả sử bạn dùng axiosInstance đã cấu hình
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaCalculator, FaTimes } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";
import formatDateToString from "../../utils/formatDateToString";
import { merge } from "lodash";

// --- Giả định bạn có các hàm helper này ---
// const formatCurrency = (num) => {
//   if (!num) return "0 đ";
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//   }).format(num);
// };

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};
// -----------------------------------------

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

// Component Modal để Sửa Goal
const EditGoalModal = ({ goal, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: goal.name,
    targetBaseAmount: goal.targetBaseAmount,
    currentBaseAmount: goal.currentBaseAmount, // Admin có thể sửa
    status: goal.status,
    deadline: goal.deadline ? goal.deadline.split("T")[0] : "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Gọi API PUT /admin/goals/:goalId
    const savePromise = axiosInstance
      .put(`/api/admin/goals/${goal._id}`, formData)
      .then((res) => res.data); //

    toast.promise(savePromise, {
      loading: "Đang lưu thay đổi...",
      success: (updatedGoal) => {
        onSave(updatedGoal); // Cập nhật state ở trang cha
        onClose(); // Đóng modal
        return "Cập nhật mục tiêu thành công!";
      },
      error: "Cập nhật thất bại!",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sửa Mục tiêu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Tên Mục tiêu */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tên mục tiêu
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {/* Mục tiêu (Số tiền) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Số tiền mục tiêu
            </label>
            <input
              type="number"
              name="targetBaseAmount"
              value={formData.targetBaseAmount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {/* Hiện tại (Số tiền) - Admin có thể sửa */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Số tiền hiện tại (Sửa thủ công)
            </label>
            <input
              type="number"
              name="currentBaseAmount"
              value={formData.currentBaseAmount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {/* Trạng thái */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="in_progress">Đang tiến hành</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
          {/* Hạn chót */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Hạn chót
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Component Trang Chính ---
const AdminGoalPage = () => {
  const [goals, setGoals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Hàm gọi API
  const fetchGoals = useCallback(async (currentPage) => {
    setLoading(true);
    try {
      // Gọi API GET /admin/goals
      const res = await axiosInstance.get("/api/admin/goals", {
        params: { page: currentPage, limit: 10 },
      }); //
      setGoals(res.data.goals);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
    } catch (err) {
      console.error("Lỗi khi tải mục tiêu:", err);
      toast.error("Không thể tải danh sách mục tiêu!");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dữ liệu khi tải trang hoặc đổi trang
  useEffect(() => {
    fetchGoals(page);
  }, [page, fetchGoals]);

  // --- Các Hàm Xử lý ---

  const handleEdit = (goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleModalSave = (updatedGoal) => {
    // Cập nhật lại danh sách goals trên UI
    setGoals(
      goals.map((g) => {
        if (g._id !== updatedGoal._id) return g;

        // clone g để tránh mutate
        const merged = { ...g, ...updatedGoal };

        // Giữ lại object userId nếu updatedGoal.userId chỉ là string
        if (
          typeof updatedGoal.userId === "string" &&
          typeof g.userId === "object"
        ) {
          merged.userId = g.userId;
        }

        return merged;
      })
    );
  };

  const handleDelete = (goal) => {
    // Dùng toast.custom để tạo xác nhận
    toast(
      (t) => (
        <span>
          Bạn có chắc muốn xóa mục tiêu "<b>{goal.name}</b>"?
          <button
            onClick={() => {
              toast.dismiss(t.id); // Đóng toast xác nhận
              // Gọi API DELETE /admin/goals/:goalId
              const deletePromise = axiosInstance.delete(
                `/api/admin/goals/${goal._id}`
              ); //

              toast.promise(deletePromise, {
                loading: "Đang xóa...",
                success: () => {
                  fetchGoals(page); // Tải lại dữ liệu
                  return "Đã xóa mục tiêu thành công!";
                },
                error: "Xóa thất bại!",
              });
            }}
            className="ml-2 px-3 py-1 rounded bg-red-600 text-white text-sm"
          >
            Xóa
          </button>
        </span>
      ),
      { duration: 6000 }
    ); // Tự đóng sau 6 giây
  };

  const handleRecalculate = (goal) => {
    // Gọi API POST /admin/goals/:goalId/recalculate
    const recalcPromise = axiosInstance.post(
      `/api/admin/goals/${goal._id}/recalculate`
    ); //

    toast.promise(recalcPromise, {
      loading: "Đang tính toán lại...",
      success: (res) => {
        handleModalSave(res.data.goal); // Cập nhật lại dòng đó
        return "Đã tính toán lại tiến độ!";
      },
      error: "Tính toán lại thất bại!",
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý Mục tiêu
      </h1>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
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
                      {goal.userId?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {goal.userId?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{goal?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(goal?.currentBaseAmount)} /{" "}
                      {formatCurrency(goal?.targetBaseAmount)}
                    </div>
                    <ProgressBar
                      current={goal.currentBaseAmount}
                      target={goal.targetBaseAmount}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        goal.isCompleted === "completed"
                          ? "bg-green-100 text-green-800"
                          : goal.isCompleted === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {goal.isCompleted}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(goal.targetDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleRecalculate(goal)}
                      className="text-green-600 hover:text-green-900"
                      title="Tính toán lại"
                    >
                      <FaCalculator />
                    </button>
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(goal)}
                      className="text-red-600 hover:text-red-900"
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

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1 || loading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Trang trước
        </button>
        <span className="text-sm text-gray-700">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages || loading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && selectedGoal && (
        <EditGoalModal
          goal={selectedGoal}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default AdminGoalPage;
