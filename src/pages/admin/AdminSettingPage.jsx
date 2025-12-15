import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  updateUser,
  requestChangePassword,
  verifyAndChangePassword,
  logoutUser,
} from "../../features/authSlice"; // Tái sử dụng action cũ
import ChangePasswordSection from "../../components/ChangePasswordSection";
import { LogOut } from "lucide-react";
// Import các icon cần thiết...

const AdminSettingPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // State đơn giản hơn nhiều
  const [name, setName] = useState(user?.name || "");
  const [isChangePassMode, setIsChangePassMode] = useState(false);
  // ... (State cho password flow giữ nguyên logic cũ)

  const handleUpdateInfo = () => {
    // Chỉ update mỗi Name
    const formData = new FormData();
    formData.append("name", name);
    dispatch(updateUser(formData))
      .unwrap()
      .then(() => toast.success("Cập nhật thông tin thành công"))
      .catch((err) => toast.error(err));
  };

  const handleLogout = async () => {
    try {
      await toast.promise(dispatch(logoutUser()).unwrap(), {
        loading: t("settingPage.toast.logoutLoading"),
        success: t("settingPage.toast.logoutSuccess"),
        error: (err) => err?.message || t("settingPage.toast.logoutError"),
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt Admin</h1>

      {/* SECTION 1: THÔNG TIN CƠ BẢN */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin quản trị viên</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Định danh)
            </label>
            <input
              type="text"
              value={user?.email}
              disabled
              className="w-full p-2 bg-gray-100 rounded border cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email không thể thay đổi để đảm bảo tính toàn vẹn của Logs.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-white rounded border focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={handleUpdateInfo}
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
          >
            Lưu thông tin
          </button>
        </div>
      </div>

      {/* Phần Bảo mật */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Bảo mật tài khoản
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Thay đổi mật khẩu quản trị viên (yêu cầu xác thực 2 bước qua Email).
        </p>

        {/* Nhúng component vào đây */}
        <div className="max-w-md">
          <ChangePasswordSection logoutOnSuccess={true} />
        </div>
      </div>

      {/* --- PHẦN NÚT ĐĂNG XUẤT --- */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg cursor-pointer hover:bg-red-100 transition-colors font-medium"
        >
          <LogOut size={20} />
          Đăng xuất khỏi hệ thống
        </button>
      </div>
    </div>
  );
};

export default AdminSettingPage;
