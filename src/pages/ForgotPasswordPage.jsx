import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaArrowLeft,
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  forgotPasswordRequest,
  resetPasswordExecute,
} from "../features/authSlice";
import toast from "react-hot-toast";
import gsap from "gsap";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate-item",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
          clearProps: "all",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [step]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      return toast.error(t("forgotPasswordPage.emailRequired"));
    }

    setLoading(true);
    try {
      await dispatch(forgotPasswordRequest(formData.email)).unwrap();
      toast.success(t("forgotPasswordPage.otpSentSuccess"));
      setStep(2);
    } catch (error) {
      toast.error(error || t("forgotPasswordPage.emailNotFound"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error(t("forgotPasswordPage.otpRequired"));
    if (formData.otp.length !== 6)
      return toast.error(t("forgotPasswordPage.otpInvalidLength"));
    if (!formData.newPassword)
      return toast.error(t("forgotPasswordPage.newPasswordRequired"));
    if (formData.newPassword.length < 6)
      return toast.error(t("forgotPasswordPage.passwordTooShort"));
    if (formData.newPassword !== formData.confirmPassword)
      return toast.error(t("forgotPasswordPage.passwordMismatch"));

    setLoading(true);
    try {
      await dispatch(
        resetPasswordExecute({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        })
      ).unwrap();
      toast.success(t("forgotPasswordPage.resetSuccess"));
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error(error || t("forgotPasswordPage.otpError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] dark:bg-[#202124] px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div
        ref={containerRef}
        className="max-w-md w-full space-y-8 bg-white dark:bg-[#2E2E33] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="animate-item mx-auto h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 hover:rotate-12">
            {step === 1 ? (
              <FaEnvelope className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <FaKey className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          <h2 className="animate-item text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {step === 1
              ? t("forgotPasswordPage.titleRequest")
              : t("forgotPasswordPage.titleReset")}
          </h2>
          <p className="animate-item text-sm text-gray-500 dark:text-gray-400">
            {step === 1
              ? t("forgotPasswordPage.descRequest")
              : t("forgotPasswordPage.descReset", { email: formData.email })}
          </p>
        </div>

        {/* FORM NHẬP EMAIL */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSendEmail}>
            <div className="rounded-md shadow-sm animate-item">
              <label htmlFor="email-address" className="sr-only">
                {t("email")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                  <FaEnvelope className="text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-400 text-gray-900 dark:text-white dark:bg-[#3a3a41] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-300"
                  placeholder={t("forgotPasswordPage.emailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="animate-item">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl cursor-pointer text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t("forgotPasswordPage.btnSendOtp")
                )}
              </button>
            </div>
          </form>
        )}

        {/* FORM RESET PASSWORD*/}
        {step === 2 && (
          <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
            {/* OTP Input */}
            <div className="relative group animate-item">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaKey className="text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
              </div>
              <input
                name="otp"
                type="text"
                maxLength={6}
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-400 text-gray-900 dark:text-white dark:bg-[#3a3a41] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-lg tracking-[0.5em] font-mono text-center transition-all duration-300"
                placeholder={t("forgotPasswordPage.otpPlaceholder")}
                value={formData.otp}
                onChange={handleChange}
              />
            </div>

            {/* New Password */}
            <div className="relative group animate-item">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
              </div>
              <input
                name="newPassword"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-400 text-gray-900 dark:text-white dark:bg-[#3a3a41] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-300"
                placeholder={t("forgotPasswordPage.newPasswordPlaceholder")}
                value={formData.newPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative group animate-item">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
              </div>
              <input
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-400 text-gray-900 dark:text-white dark:bg-[#3a3a41] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-300"
                placeholder={t("forgotPasswordPage.confirmPasswordPlaceholder")}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 animate-item">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 hover:scale-[1.02]"
              >
                {t("forgotPasswordPage.btnBack")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl cursor-pointer text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t("forgotPasswordPage.btnConfirm")
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="flex items-center justify-center pt-2 animate-item">
          <Link
            to="/login"
            className="flex items-center font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors duration-200 hover:underline"
          >
            <FaArrowLeft className="mr-2 text-sm" />
            {t("forgotPasswordPage.linkBackToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
