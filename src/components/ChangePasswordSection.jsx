// src/components/common/ChangePasswordSection.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  requestChangePassword,
  verifyAndChangePassword,
  logoutUser,
} from "../features/authSlice"; // Sửa đường dẫn import cho đúng với dự án của bạn

const ChangePasswordSection = ({
  logoutOnSuccess = true, // Option: Có logout sau khi đổi thành công không?
  className = "",
}) => {
  const user = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // --- LOCAL STATE ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [step, setStep] = useState(1); // 1: Old Pass, 2: OTP & New Pass
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    current: "",
    new: "",
    confirm: "",
    otp: "",
  });

  useEffect(() => {
    const currentLang = localStorage.getItem("lang");
    if (!currentLang) {
      i18n.changeLanguage("vi");
    }
  }, [i18n]);

  // --- HANDLERS ---
  const resetForm = () => {
    setIsEditMode(false);
    setStep(1);
    setFormData({ current: "", new: "", confirm: "", otp: "" });
    setShowPassword(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Bước 1: Gửi mật khẩu cũ -> Lấy OTP
  const handleRequestOTP = async () => {
    if (!formData.current)
      return toast.error(
        t("validate.passwordRequired") || "Vui lòng nhập mật khẩu hiện tại"
      );

    setLoading(true);
    try {
      await dispatch(
        requestChangePassword({ oldPassword: formData.current })
      ).unwrap();
      toast.success(t("otpSentSuccess") || "Mã OTP đã được gửi đến email!");
      setStep(2);
    } catch (error) {
      toast.error(error || t("error"));
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP -> Đổi mật khẩu
  const handleVerifyAndChange = async () => {
    // Validate
    if (!formData.otp) return toast.error("Vui lòng nhập mã OTP");
    if (formData.otp.length !== 6) return toast.error("Mã OTP phải có 6 ký tự");
    if (!formData.new) return toast.error("Vui lòng nhập mật khẩu mới");
    if (formData.new.length < 6)
      return toast.error("Mật khẩu mới phải từ 6 ký tự");
    if (formData.new !== formData.confirm)
      return toast.error("Mật khẩu xác nhận không khớp");

    setLoading(true);
    try {
      await dispatch(
        verifyAndChangePassword({
          otp: formData.otp,
          newPassword: formData.new,
        })
      ).unwrap();

      toast.success("Đổi mật khẩu thành công!");

      resetForm();

      if (logoutOnSuccess) {
        toast.loading("Đang đăng xuất để bảo mật...", { duration: 2000 });
        setTimeout(() => {
          dispatch(logoutUser());
          // Navigate sẽ được xử lý ở App.js hoặc component cha khi user = null
          window.location.href = "/login";
        }, 1500);
      }
    } catch (error) {
      toast.error(error || t("error"));
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className={`w-full ${className}`}>
      {!isEditMode ? (
        // VIEW MODE
        <div className="flex items-center justify-between py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              {t("password") || "Mật khẩu"}
            </label>
            <p className="text-sm text-gray-500">••••••••</p>
          </div>
          <button
            onClick={() => setIsEditMode(true)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 cursor-pointer hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg transition-colors"
          >
            {t("settingPage.changePassword")}
          </button>
        </div>
      ) : (
        // EDIT MODE
        <div className="bg-gray-50 dark:bg-[#3a3a41] p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-fadeIn">
          {/* Header Form */}
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
            <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
              {step === 1
                ? "Bước 1: Xác thực mật khẩu cũ"
                : "Bước 2: Xác thực OTP & Đổi mới"}
            </h4>
            <button
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-red-500 underline cursor-pointer"
            >
              {t("cancel") || "Hủy"}
            </button>
          </div>

          {step === 1 ? (
            // FORM STEP 1
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Nhập mật khẩu hiện tại để nhận mã xác thực.
              </p>
              <div>
                <input
                  type="password"
                  name="current"
                  value={formData.current}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="Mật khẩu hiện tại..."
                />
              </div>
              <button
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex justify-center items-center gap-2 cursor-pointer"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                )}
                {t("continue") || "Tiếp tục"}
              </button>
            </div>
          ) : (
            // FORM STEP 2
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-xs text-yellow-700 dark:text-yellow-400">
                📩 OTP đã được gửi. Kiểm tra email của bạn.
              </div>

              {/* OTP */}
              <div>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-center tracking-widest text-lg"
                  placeholder="OTP (6 số)"
                  maxLength={6}
                />
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="new"
                  value={formData.new}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-10 text-sm"
                  placeholder="Mật khẩu mới..."
                />
                <button
                  className="absolute right-3 top-2.5 text-gray-400 cursor-pointer hover:text-indigo-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  type="password"
                  name="confirm"
                  value={formData.confirm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="Xác nhận mật khẩu..."
                />
              </div>

              <button
                onClick={handleVerifyAndChange}
                disabled={loading}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex justify-center items-center gap-2 cursor-pointer"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                )}
                {t("confirm") || "Xác nhận đổi"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChangePasswordSection;
