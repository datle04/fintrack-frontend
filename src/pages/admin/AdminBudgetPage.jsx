import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaFilter, FaHashtag } from "react-icons/fa"; // Thêm icon
import { IoCloseCircle } from "react-icons/io5";
import { formatCurrency } from "../../utils/formatCurrency";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import {
  deleteAdminBudget,
  fetchAdminBudgets,
  getBudgetById,
} from "../../features/adminBudgetSlice";
import EditBudgetModal from "../../components/AdminBudgetComponent/EditBudgetModal";
import ConfirmModal from "../../components/ConfirmModal";
import Pagination from "../../components/Pagination"; // Import Pagination component

const AdminBudgetPage = () => {
  const dispatch = useDispatch();

  // Safe Access State
  const budgets = useSelector((state) => state.adminBudgets.budgets) || [];
  const pagination = useSelector((state) => state.adminBudgets.pagination);
  const loading = useSelector((state) => state.adminBudgets.loading);
  const error = useSelector((state) => state.adminBudgets.error);

  // --- STATE ---
  const [page, setPage] = useState(1);

  // Filter States
  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Modal States
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. API CALL ---
  const fetchBudgets = useCallback(
    (pageNumber, uId, m, y) => {
      dispatch(
        fetchAdminBudgets({
          page: pageNumber,
          userId: uId,
          month: m,
          year: y,
          limit: 10, // Đồng bộ limit
        })
      );
    },
    [dispatch]
  );

  // --- 2. DEBOUNCE SEARCH (USER ID) ---
  const debouncedFetch = useMemo(() => {
    return debounce((pageNumber, uId, m, y) => {
      fetchBudgets(pageNumber, uId, m, y);
    }, 500);
  }, [fetchBudgets]);

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  // --- 3. EFFECTS ---

  // Effect cho User ID (Debounce)
  useEffect(() => {
    debouncedFetch(page, userId, month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Effect cho Month/Year/Page (Gọi ngay)
  useEffect(() => {
    fetchBudgets(page, userId, month, year);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, month, year]);

  // Error Handling
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // --- HANDLERS ---
  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleDelete = (budget) => {
    setSelectedBudget(budget);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (reason) => {
    if (!selectedBudget) return;
    setIsDeleting(true);
    try {
      await dispatch(
        deleteAdminBudget({
          budgetId: selectedBudget._id,
          reason: reason,
        })
      ).unwrap();

      toast.success("Đã xóa ngân sách thành công!");
      setIsDeleteModalOpen(false);
      setSelectedBudget(null);

      // Refresh list
      fetchBudgets(page, userId, month, year);
    } catch (err) {
      toast.error(err?.message || "Lỗi khi xóa ngân sách!");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper tạo danh sách năm (ví dụ: 5 năm trước -> 2 năm sau)
  const years = Array.from(
    { length: 8 },
    (_, i) => new Date().getFullYear() - 5 + i
  );

  return (
    <div className="p-4 sm:p-6 bg-blue-50/50 min-h-screen">
      <div className="sm:hidden text-center text-gray-500 mt-10 px-4">
        Vui lòng sử dụng máy tính để quản lý ngân sách tốt nhất.
      </div>

      <div className="hidden sm:block">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Quản lý Ngân sách
        </h1>

        {/* --- MODERN FILTER BAR --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm font-medium">
            <FaFilter className="text-blue-500" />
            <span>Bộ lọc tìm kiếm</span>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 1. INPUT TÌM USER ID */}
            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaHashtag className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm User ID..."
                value={userId}
                onChange={handleUserIdChange}
                className="block w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono"
              />
              {userId && (
                <button
                  onClick={() => handleUserIdChange({ target: { value: "" } })}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <IoCloseCircle size={16} />
                </button>
              )}
            </div>

            {/* GROUP SELECTS: MONTH & YEAR */}
            <div className="flex flex-1 w-full md:w-auto gap-3 justify-end">
              {/* Select Month */}
              <div className="relative min-w-[140px]">
                <select
                  value={month}
                  onChange={(e) => handleFilterChange(setMonth, e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 hover:border-blue-400 cursor-pointer"
                >
                  <option value="">Tất cả tháng</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Select Year */}
              <div className="relative min-w-[140px]">
                <select
                  value={year}
                  onChange={(e) => handleFilterChange(setYear, e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 hover:border-blue-400 cursor-pointer"
                >
                  <option value="">Tất cả năm</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-semibold text-xs">
                <tr>
                  <th className="p-4">Người dùng</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4 hidden md:table-cell">Chi tiết</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {budgets && budgets.length > 0 ? (
                  budgets.map((budget) => (
                    <tr
                      key={budget._id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {budget.user?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {budget.user?.email}
                        </div>
                        {/* ID nhỏ bên dưới */}
                        <div
                          className="mt-1 inline-block text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 cursor-pointer hover:text-blue-500"
                          onClick={() => {
                            navigator.clipboard.writeText(budget.user?._id);
                            toast.success("Copied User ID");
                          }}
                          title={budget.user?._id}
                        >
                          {budget.user?._id?.slice(-6)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                          Tháng {budget.month}/{budget.year}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-gray-800">
                          {formatCurrency(
                            budget.originalAmount,
                            budget.originalCurrency
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-gray-500 text-xs">
                        {budget.categories?.length || 0} danh mục con
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(budget)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      Không tìm thấy ngân sách nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- PAGINATION --- */}
        <div className="mt-6 flex justify-center">
          <Pagination
            page={page}
            totalPages={pagination.totalPages || 1}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>

        {isDeleteModalOpen && selectedBudget && (
          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
            title="Xóa ngân sách này?"
            message={`Bạn có chắc chắn muốn xóa ngân sách tháng ${selectedBudget.month}/${selectedBudget.year} của ${selectedBudget.user?.name}?`}
            variant="danger"
            confirmText="Xóa bỏ"
            requireReason={true}
          />
        )}
      </div>
    </div>
  );
};

export default AdminBudgetPage;
