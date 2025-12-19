import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminBanUser,
  adminDeleteUser,
  adminGetUsers,
  adminUnbanUser,
  adminUpdateUser,
} from "../../features/userSlice";
import formatDateToString from "../../utils/formatDateToString";
import {
  FaRegTrashAlt,
  FaBan,
  FaEdit,
  FaSearch,
  FaFilter,
  FaHashtag,
} from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { debounce } from "lodash";
import Pagination from "../../components/Pagination";
import EditUserModal from "../../components/AdminUserComponent/EditUserModal";
import ConfirmModal from "../../components/ConfirmModal";
import toast from "react-hot-toast";

// Helper Badge
const badgeClass = (type, value) => {
  if (type === "role") {
    return value === "admin"
      ? "bg-blue-100 text-blue-700 border border-blue-200"
      : "bg-gray-100 text-gray-700 border border-gray-200";
  }
  if (type === "status") {
    const strStatus = String(value);
    return strStatus === "true"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-green-100 text-green-700 border border-green-200";
  }
  return "";
};

const AdminUser = () => {
  const users = useSelector((state) => state.users.users) || [];
  const totalPages = useSelector((state) => state.users.totalPages);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState("ban");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = useCallback(
    (searchTerm, searchIdTerm, roleFilter, statusFilter, pageNumber) => {
      dispatch(
        adminGetUsers({
          name: searchTerm,
          email: searchTerm,
          id: searchIdTerm,
          role: roleFilter,
          isBanned: statusFilter,
          page: pageNumber,
          limit: 10,
        })
      );
    },
    [dispatch]
  );

  const debouncedFetch = useMemo(() => {
    return debounce((searchTerm, searchIdTerm, r, s, p) => {
      fetchUsers(searchTerm, searchIdTerm, r, s, p);
    }, 500);
  }, [fetchUsers]);

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  useEffect(() => {
    debouncedFetch(search, searchId, role, status, page);
  }, [search, searchId]);

  useEffect(() => {
    fetchUsers(search, searchId, role, status, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, role, status]);

  const handleSearchIdChange = (e) => {
    setSearchId(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleOpenConfirmModal = ({ type, user }) => {
    setSelectedUser(user);
    setConfirmModalType(type);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async (reason) => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      let action;
      let successMessage = "";

      switch (confirmModalType) {
        case "ban":
          action = adminBanUser({ id: selectedUser._id, reason });
          successMessage = `Đã cấm người dùng ${selectedUser.name}`;
          break;
        case "unban":
          action = adminUnbanUser(selectedUser._id);
          successMessage = `Đã gỡ cấm người dùng ${selectedUser.name}`;
          break;
        case "delete":
          action = adminDeleteUser({ id: selectedUser._id, reason });
          successMessage = "Đã xóa người dùng thành công";
          break;
        default:
          throw new Error("Hành động không hợp lệ");
      }

      await dispatch(action).unwrap();
      toast.success(successMessage);
      fetchUsers(search, searchId, role, status, page);
      setIsConfirmModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra!");
    } finally {
      setIsProcessing(false);
    }
  };

  const getModalProps = () => {
    if (!selectedUser) return {};
    switch (confirmModalType) {
      case "ban":
        return {
          title: "Cấm người dùng này?",
          message: `Bạn có chắc chắn muốn cấm tài khoản "${selectedUser.name}"?`,
          variant: "warning",
          confirmText: "Cấm ngay",
          requireReason: true,
        };
      case "unban":
        return {
          title: "Gỡ lệnh cấm?",
          message: `Khôi phục quyền truy cập cho tài khoản "${selectedUser.name}"?`,
          variant: "success",
          confirmText: "Gỡ cấm",
          requireReason: false,
        };
      case "delete":
        return {
          title: "Xóa vĩnh viễn?",
          message: `Hành động này sẽ xóa hoàn toàn user "${selectedUser.name}". Không thể hoàn tác!`,
          variant: "danger",
          confirmText: "Xóa bỏ",
          requireReason: true,
        };
      default:
        return {};
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-blue-50/50 min-h-screen">
      <div className="sm:hidden text-center text-gray-500 mt-10 px-4">
        Vui lòng sử dụng máy tính để quản lý người dùng tốt nhất.
      </div>

      <div className="hidden sm:block">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Quản lý người dùng
        </h1>

        {/* --- MODERN FILTER BAR --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm font-medium">
            <FaFilter className="text-blue-500" />
            <span>Bộ lọc tìm kiếm</span>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 justify-between">
            {/* GROUP SEARCH: ID & NAME */}
            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
              <div className="relative w-full md:w-48 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaHashtag className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm User ID..."
                  className="block w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono"
                  value={searchId}
                  onChange={handleSearchIdChange}
                />
                {searchId && (
                  <button
                    onClick={() =>
                      handleSearchIdChange({ target: { value: "" } })
                    }
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <IoCloseCircle size={16} />
                  </button>
                )}
              </div>

              <div className="relative w-full md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  value={search}
                  onChange={handleSearchChange}
                />
                {search && (
                  <button
                    onClick={() =>
                      handleSearchChange({ target: { value: "" } })
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <IoCloseCircle size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* GROUP FILTERS: ROLE & STATUS */}
            <div className="flex flex-1 flex-wrap gap-3 xl:justify-end">
              {/* Select Role */}
              <div className="relative min-w-[160px]">
                <select
                  value={role}
                  onChange={(e) => handleFilterChange(setRole, e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 hover:border-blue-400 cursor-pointer"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="user">Người dùng</option>
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

              {/* Select Status */}
              <div className="relative min-w-[160px]">
                <select
                  value={status}
                  onChange={(e) =>
                    handleFilterChange(setStatus, e.target.value)
                  }
                  className="appearance-none w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 hover:border-blue-400 cursor-pointer"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="false">Hoạt động</option>
                  <option value="true">Bị khóa</option>
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
                  <th className="p-4">ID</th>
                  <th className="p-4 hidden lg:table-cell">Tên</th>
                  <th className="p-4 hidden lg:table-cell">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="p-4">
                        <span
                          className="font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs select-all cursor-pointer hover:bg-gray-200"
                          title={user._id}
                          onClick={() => {
                            navigator.clipboard.writeText(user._id);
                            toast.success("Đã copy ID");
                          }}
                        >
                          {user._id.slice(-6)}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-900 hidden lg:table-cell">
                        {user.name}
                      </td>
                      <td className="p-4 text-gray-500 hidden lg:table-cell">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(
                            "role",
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(
                            "status",
                            user.isBanned
                          )}`}
                        >
                          {user.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {formatDateToString(user.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FaEdit size={16} />
                          </button>

                          {user.isBanned ? (
                            <button
                              onClick={() =>
                                handleOpenConfirmModal({ type: "unban", user })
                              }
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Mở khóa"
                            >
                              <FaUnlockKeyhole size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleOpenConfirmModal({ type: "ban", user })
                              }
                              className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                              title="Cấm user"
                            >
                              <FaBan size={16} />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleOpenConfirmModal({ type: "delete", user })
                            }
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Xóa vĩnh viễn"
                          >
                            <FaRegTrashAlt size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isConfirmModalOpen && selectedUser && (
          <ConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => !isProcessing && setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmAction}
            isLoading={isProcessing}
            {...getModalProps()}
          />
        )}

        {isEditOpen && selectedUser && (
          <EditUserModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            user={selectedUser}
            onSave={(updatedData) => {
              const action = dispatch(
                adminUpdateUser({ id: selectedUser._id, formData: updatedData })
              ).unwrap();

              toast.promise(action, {
                loading: "Đang cập nhật...",
                success: "Cập nhật thành công!",
                error: (err) => err || "Thất bại!",
              });
              fetchUsers(search, searchId, role, status, page);
              setIsEditOpen(false);
            }}
          />
        )}

        <div className="mt-6 flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUser;
