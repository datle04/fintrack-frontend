import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Shield, User, Lock, Save, X, AlertCircle } from "lucide-react";
import { currencyMap } from "../../constant/currencies";

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    role: "user",
    reason: "",
  });

  const [displayData, setDisplayData] = useState({});

  useEffect(() => {
    if (user) {
      setDisplayData({
        name: user.name || "",
        email: user.email || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        address: user.address || "",
        phone: user.phone || "",
        currency: user.currency || "VND",
      });

      setFormData({
        role: user.role || "user",
        reason: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.role) return;

    if (!formData.reason.trim()) {
      toast.error("Vui lòng nhập lý do thay đổi quyền hạn!");
      return;
    }

    onSave({
      ...formData,
      id: user._id,
    });
  };

  if (!isOpen) return null;

  // Class chung cho input bị disabled
  const disabledInputClass =
    "w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg px-3 py-2.5 text-sm cursor-not-allowed focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E1E24] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Quản lý Quyền hạn
              </h2>
              <p className="text-xs text-gray-500">ID: {user?._id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* SECTION 1: THÔNG TIN CÁ NHÂN (READ-ONLY) */}
          <div className="space-y-4 opacity-75">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Thông tin cá nhân (Chỉ xem)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={displayData.name}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  value={displayData.email}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">
                  SĐT
                </label>
                <input
                  type="text"
                  value={displayData.phone}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={displayData.dob}
                  disabled
                  className={disabledInputClass}
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">
                Địa chỉ
              </label>
              <input
                type="text"
                value={displayData.address}
                disabled
                className={disabledInputClass}
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* SECTION 2: PHÂN QUYỀN (EDITABLE) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={16} className="text-indigo-500" />
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Cài đặt Quyền & Bảo mật
              </h3>
            </div>

            {/* Role Select */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Vai trò hệ thống
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border-2 border-indigo-200 dark:border-indigo-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-[#2a2a30] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="user">User (Người dùng thường)</option>
                <option value="admin">Admin (Quản trị viên)</option>
              </select>
              <p className="mt-2 text-xs text-indigo-600/80 flex items-start gap-1">
                <AlertCircle size={12} className="mt-0.5" />
                Thay đổi vai trò sẽ cấp hoặc thu hồi quyền truy cập vào trang
                quản trị.
              </p>
            </div>

            {/* Reason Input */}
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Lý do thay đổi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                rows="3"
                value={formData.reason}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none bg-white dark:bg-[#2a2a30] dark:text-white"
                placeholder="Nhập lý do chi tiết cho việc thay đổi quyền hạn này..."
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Save size={18} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
