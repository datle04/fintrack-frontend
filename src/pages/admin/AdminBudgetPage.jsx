import React, { useState, useEffect, useCallback } from "react";
// Giả sử bạn dùng axiosInstance đã cấu hình
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaTimes, FaFilter } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAdminBudget,
  fetchAdminBudgets,
  getBudgetById,
  updateAdminBudget,
} from "../../features/adminBudgetSlice";
import EditBudgetModal from "../../components/AdminBudgetComponent/EditBudgetModal";
import ConfirmModal from "../../components/ConfirmModal";

const AdminBudgetPage = () => {
  const dispatch = useDispatch();
  // Lấy state từ slice MỚI
  const { budgets, pagination, loading, error } = useSelector(
    (state) => state.adminBudgets // <-- Lấy từ adminBudgets
  );
  const [page, setPage] = useState(pagination.page);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // (Filter state vẫn giữ ở local)
  const [filters, setFilters] = useState({
    userId: "",
    month: "",
    year: new Date().getFullYear().toString(),
  });
  const [filterParams, setFilterParams] = useState({
    year: new Date().getFullYear().toString(),
  });
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Hàm gọi API
  const fetchBudgets = useCallback(
    (currentPage, params) => {
      dispatch(fetchAdminBudgets({ page: currentPage, ...params }));
    },
    [dispatch]
  );

  // Fetch dữ liệu
  useEffect(() => {
    fetchBudgets(page, filterParams);
  }, [page, filterParams, fetchBudgets]);

  // Xử lý Lỗi
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const applyFilters = () => {
    fetchBudgets(1, filters); // Gọi fetch với page 1 và filter mới
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    dispatch(getBudgetById(budget._id));
    setIsModalOpen(true); // Mở modal
  };

  const handleDelete = (budget) => {
    setSelectedBudget(budget);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý Ngân sách
      </h1>

      {/* Vùng Bộ lọc */}
      <div className="p-4 bg-white shadow-md rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}
            placeholder="Lọc theo User ID"
            className="block w-full p-2 rounded-md border-slate-300 outline-none shadow-sm text-sm"
          />
          <input
            type="number"
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            placeholder="Lọc theo Tháng (1-12)"
            className="block w-full p-2 outline-none rounded-md border-slate-300 shadow-sm text-sm"
          />
          <input
            type="number"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            placeholder="Lọc theo Năm (YYYY)"
            className="block w-full p-2 outline-none rounded-md border-slate-300 shadow-sm text-sm"
          />
          <button
            onClick={applyFilters}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm cursor-pointer"
          >
            <FaFilter className="mr-2" />
            Lọc
          </button>
        </div>
      </div>

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
                  Ngân sách (Tháng/Năm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chi tiết Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.map((budget) => (
                <tr key={budget._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {budget.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {budget.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {budget.month} / {budget.year}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(
                        budget.originalAmount,
                        budget.originalCurrency
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {budget.categories.length} danh mục con
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(budget)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
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
          onClick={() => setPage(pagination.page - 1)}
          disabled={pagination.page <= 1 || loading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-50"
        >
          Trang trước
        </button>
        <span className="text-sm text-gray-700">
          Trang {pagination.page} / {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages || loading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && selectedBudget && (
        <EditBudgetModal
          budget={selectedBudget}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBudget(null);
          }}
        />
      )}

      {isDeleteModalOpen && selectedBudget && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          modalType="budget"
          type="delete"
          budget={selectedBudget}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedBudget(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminBudgetPage;
