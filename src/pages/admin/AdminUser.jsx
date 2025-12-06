import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminBanUser,
  adminDeleteUser,
  adminGetUsers,
  adminUnbanUser,
  adminUpdateUser,
} from "../../features/userSlice";
import formatDateToString from "../../utils/formatDateToString";
import { FaRegTrashAlt } from "react-icons/fa";
import { debounce } from "lodash";
import Pagination from "../../components/Pagination";
import EditUserModal from "../../components/AdminUserComponent/EditUserModal";
import { FaBan } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";
import { FaUnlockKeyhole } from "react-icons/fa6";

const badgeClass = (type, value) => {
  if (type === "role") {
    return value === "admin"
      ? "bg-blue-400 text-white"
      : "bg-gray-400 text-white";
  }

  if (type === "status") {
    const boolStatus = value === true || value === "true";
    return boolStatus
      ? "bg-red-200 text-red-800"
      : "bg-green-200 text-green-800";
  }

  return ""; // fallback tránh lỗi render nếu type không khớp
};

const AdminUser = () => {
  const users = useSelector((state) => state.users.users);
  const totalPages = useSelector((state) => state.users.totalPages);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState("ban"); // 'ban' | 'unban' | 'delete'
  const [isProcessing, setIsProcessing] = useState(false); // Loading state cho modal

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  useEffect(() => {
    console.log(users);
  }, []);

  const debouncedSearch = useMemo(() => {
    return debounce((searchValue, roleValue, statusValue, pageNumber = 1) => {
      dispatch(
        adminGetUsers({
          name: searchValue,
          email: searchValue,
          role: roleValue,
          isBanned: statusValue,
          page: pageNumber,
          limit: 20,
        })
      );
    }, 500);
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Gọi API khi role hoặc status thay đổi
  useEffect(() => {
    debouncedSearch(search, role, status, page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    debouncedSearch(search, role, status, 1);
  }, [role, status]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    debouncedSearch(value, role, status, 1);
  };

  // Hàm mở modal (thay thế cho handleDelete cũ)
  const handleOpenConfirmModal = ({ type, user }) => {
    setSelectedUser(user);
    setConfirmModalType(type);
    setIsConfirmModalOpen(true);
  };

  // --- HÀM XỬ LÝ LOGIC CONFIRM (QUAN TRỌNG NHẤT) ---
  const handleConfirmAction = async (reason) => {
    if (!selectedUser) return;
    setIsProcessing(true); // Bật loading

    try {
      let action;
      let successMessage = "";

      // Chọn hành động dựa trên loại modal
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
          // Nếu API delete có hỗ trợ lưu reason thì truyền vào, không thì chỉ truyền ID
          action = adminDeleteUser({ id: selectedUser._id, reason });
          successMessage = "Đã xóa người dùng thành công";
          break;
        default:
          throw new Error("Hành động không hợp lệ");
      }

      // Dispatch action
      await dispatch(action).unwrap();

      toast.success(successMessage);
      setIsConfirmModalOpen(false); // Đóng modal
      setSelectedUser(null);

      // Refresh lại list user hiện tại (nếu cần)
      // debouncedSearch(search, role, status, page);
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra!");
    } finally {
      setIsProcessing(false); // Tắt loading
    }
  };

  // --- CẤU HÌNH GIAO DIỆN MODAL DỰA TRÊN TYPE ---
  const getModalProps = () => {
    if (!selectedUser) return {};

    switch (confirmModalType) {
      case "ban":
        return {
          title: "Cấm người dùng này?",
          message: `Bạn có chắc chắn muốn cấm tài khoản "${selectedUser.name}"? Người dùng này sẽ không thể đăng nhập.`,
          variant: "warning", // Màu cam
          confirmText: "Cấm ngay",
          requireReason: true, // Bắt buộc nhập lý do
        };
      case "unban":
        return {
          title: "Gỡ lệnh cấm?",
          message: `Khôi phục quyền truy cập cho tài khoản "${selectedUser.name}"?`,
          variant: "success", // Màu xanh lá
          confirmText: "Gỡ cấm",
          requireReason: false, // Không cần lý do
        };
      case "delete":
        return {
          title: "Xóa vĩnh viễn?",
          message: `Hành động này sẽ xóa hoàn toàn user "${selectedUser.name}" và dữ liệu liên quan. Không thể hoàn tác!`,
          variant: "danger", // Màu đỏ
          confirmText: "Xóa bỏ",
          requireReason: true, // Admin xóa nên nhập lý do để log
        };
      default:
        return {};
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-blue-50 min-h-screen">
      {/* Ẩn hoàn toàn trên điện thoại */}
      <div className="sm:hidden text-center text-gray-600 mt-10">
        Trang quản lý người dùng chỉ khả dụng trên máy tính hoặc máy tính bảng.
      </div>

      <div className="hidden sm:block">
        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="border border-slate-300 bg-white px-4 py-2 rounded shadow-sm focus:outline-none w-full max-w-xs"
            value={search}
            onChange={handleSearchChange}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-slate-300 bg-white cursor-pointer px-4 py-2 rounded shadow-sm focus:outline-none
          "
          >
            <option value="">Chọn Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              e.target.value === "banned" ? setStatus(true) : setStatus(false);
            }}
            className="border border-slate-300 bg-white cursor-pointer px-4 py-2 rounded shadow-sm focus:outline-none
          "
          >
            <option>Chọn Trạng thái</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <EditUserModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={selectedUser}
          onSave={(updatedData) => {
            const action = dispatch(
              adminUpdateUser({ id: selectedUser._id, formData: updatedData })
            ).unwrap(); // ✅ Trả Promise thật sự

            toast.promise(action, {
              loading: "Đang cập nhật thông tin người dùng...",
              success: "Cập nhật thành công!",
              error: (err) => err || "Cập nhật thất bại!",
            });

            setIsEditOpen(false);
          }}
        />

        {/* Bảng người dùng */}
        <div className="overflow-x-auto bg-white border-slate-300 rounded shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-100">
              <tr className="3xl:text-base">
                <th className="p-3">ID</th>
                <th className="p-3 hidden lg:table-cell">Tên</th>
                <th className="p-3 hidden lg:table-cell">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3 ">Trạng thái</th>
                <th className="p-3 ">Ngày tạo</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-3 font-semibold">{user._id}</td>
                  <td className="p-3 hidden lg:table-cell">{user.name}</td>
                  <td className="p-3 text-blue-600 underline hidden lg:table-cell">
                    {user.email}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${badgeClass(
                        "role",
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 ">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${badgeClass(
                        "status",
                        user.isBanned
                      )}`}
                    >
                      {user.isBanned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="p-3 ">{formatDateToString(user.createdAt)}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="
                        p-1 text-blue-500 hover:bg-blue-100 cursor-pointer transition-all border border-blue-300 rounded lg:text-base 3xl:text-base
                    "
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() =>
                        handleOpenConfirmModal({ type: "delete", user })
                      }
                      className="
                        p-1 text-red-500 hover:bg-red-100 cursor-pointer transition-all border border-red-300 rounded lg:text-base 3xl:text-base
                    "
                    >
                      <FaRegTrashAlt />
                    </button>
                    {user.isBanned ? (
                      <button
                        onClick={() =>
                          handleOpenConfirmModal({ type: "unban", user })
                        }
                        className="
                          p-1 text-green-500 hover:bg-green-100 cursor-pointer transition-all border border-green-300 rounded lg:text-base 3xl:text-
                        "
                      >
                        <FaUnlockKeyhole />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleOpenConfirmModal({ type: "ban", user })
                        }
                        className="
                          p-1 text-orange-500 hover:bg-orange-100 cursor-pointer transition-all border border-orange-300 rounded lg:text-base 3xl:text-
                        "
                      >
                        <FaBan />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isConfirmModalOpen && selectedUser && (
          <ConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => {
              if (!isProcessing) setIsConfirmModalOpen(false);
            }}
            onConfirm={handleConfirmAction} // Hàm xử lý logic chung
            isLoading={isProcessing} // State loading
            {...getModalProps()} // Spread các props cấu hình (title, message, variant...)
          />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
};

export default AdminUser;
