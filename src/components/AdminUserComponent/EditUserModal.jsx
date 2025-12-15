import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { currencyMap } from "../../constant/currencies";

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "user",
    dob: user?.dob || "",
    address: user?.address || "",
    phone: user?.phone || "",
    currency: user?.currency || "VND",
    reason: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        id: user._id || "",
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        dob: user.dob || "",
        address: user.address || "",
        phone: user.phone || "",
        currency: user.currency || "VND",
        reason: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Chỉnh sửa người dùng</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tên
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Nhập tên người dùng..."
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Nhập email..."
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Ngày sinh
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Nhập ngày sinh..."
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              SĐT
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Nhập SĐT..."
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Nhập địa chỉ..."
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Vai trò
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Đơn vị tiền tệ
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {[...currencyMap].map(([code, label]) => (
                <option key={code} value={code} className="dark:bg-[#2E2E33]">
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Lý do
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Nhập lý do cho các thay đổi..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
