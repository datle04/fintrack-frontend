import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaGlobe,
  FaImage,
  FaUserCircle,
  FaShieldAlt,
  FaPalette,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo, logoutUser, updateUser } from "../features/authSlice";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import EditableField from "../components/EditableField";
import { currencyMap } from "../utils/currencies";

const SettingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  // 1. STATE CHO TAB (Mới)
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security' | 'interface'

  const [language, setLanguage] = useState(
    localStorage.getItem("lang") || "vi"
  );

  const [profile, setProfile] = useState({
    name: user?.name,
    phone: user?.phone,
    currency: user?.currency || "VND",
    dob: user?.dob,
    address: user?.address,
  });
  const initialProfile = useRef(profile);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isDirty =
    JSON.stringify(profile) !== JSON.stringify(initialProfile.current) ||
    avatarFile !== null;

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("lang", language);
  }, [language]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!user) {
      dispatch(getUserInfo());
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (!isDirty) return;

    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("phone", profile.phone);
    formData.append("currency", profile.currency);
    formData.append("dob", profile.dob);
    formData.append("address", profile.address);

    // Đảm bảo key là 'avatar' (hoặc key mà backend bạn yêu cầu)
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const promise = dispatch(updateUser(formData)).unwrap();

    toast
      .promise(promise, {
        loading: t("saving"), // Nên truyền string
        // Dùng function để render JSX an toàn hơn
        success: () => <b>{t("saveSuccess")}</b>,
        error: (err) => <b>{`${t("saveError")}: ${err?.message || "Lỗi"}`}</b>,
      })
      .then((updatedUser) => {
        // Cập nhật lại ref để nút Lưu disable đi
        // Quan trọng: Update state profile với dữ liệu mới từ server trả về để đồng bộ
        const newProfile = {
          name: updatedUser.name,
          phone: updatedUser.phone,
          currency: updatedUser.currency,
          dob: updatedUser.dob,
          address: updatedUser.address,
        };
        setProfile(newProfile);
        initialProfile.current = newProfile;

        setAvatarFile(null);
      })
      .catch((err) => {
        console.error("Update failed:", err);
      });
  };

  const handleLogout = async () => {
    try {
      await toast.promise(dispatch(logoutUser()).unwrap(), {
        loading: "Đang đăng xuất...",
        success: "Đã đăng xuất! 👋",
        error: (err) => err?.message || "Đăng xuất thất bại!",
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };
  // 2. CẤU HÌNH DANH SÁCH TAB (Mới)
  const tabs = useMemo(
    () => [
      {
        id: "profile",
        label: t("userInfo") || "Thông tin cá nhân",
        icon: <FaUserCircle />,
      },
      {
        id: "security",
        label: t("security") || "Tài khoản & Bảo mật",
        icon: <FaShieldAlt />,
      },
      {
        id: "interface",
        label: t("interface") || "Giao diện & Ngôn ngữ",
        icon: <FaPalette />,
      },
    ],
    [t]
  );

  // 3. HÀM RENDER NỘI DUNG THEO TAB (Mới)
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              {t("userInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditableField
                label={t("name")}
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
              <EditableField
                label={t("phone")}
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
              <EditableField
                label={t("dob")}
                value={profile.dob}
                type="date"
                onChange={(e) =>
                  setProfile({ ...profile, dob: e.target.value })
                }
              />
              <EditableField
                label={t("address")}
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("currency")}
                </label>
                <select
                  value={profile.currency}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#3a3a41] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  {[...currencyMap].map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nút Save đặt ở đây cho Tab Profile */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={!isDirty}
                className={`px-8 py-2.5 text-white rounded-xl font-medium transition-all ${
                  isDirty
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {t("save")}
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              Tài khoản & Bảo mật
            </h3>
            <div className="space-y-6 max-w-lg">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={user?.email}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("password")}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value="123456" // Dummy value
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 cursor-not-allowed pr-10"
                />
                <button
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-indigo-600"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors w-full sm:w-auto"
                >
                  {t("logout")}
                </button>
              </div>
            </div>
          </div>
        );

      case "interface":
        return (
          <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              {t("interface")}
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">
                    {t("theme")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Chọn giao diện sáng hoặc tối
                  </p>
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                  {["light", "dark"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => toggleTheme(mode)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        theme === mode
                          ? "bg-white dark:bg-[#3a3a41] shadow text-indigo-600"
                          : "text-gray-500"
                      }`}
                    >
                      {mode === "light" ? "☀️ Sáng" : "🌙 Tối"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">
                    {t("language")}
                  </p>
                  <p className="text-sm text-gray-500">Ngôn ngữ hiển thị</p>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-3 pr-8 text-sm cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {t("setting")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- CỘT TRÁI (Sidebar Menu) --- */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Summary Card */}
            <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 shadow-sm text-center border border-gray-100 dark:border-slate-700">
              <div
                className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {avatarPreview ||
                (user?.avatarUrl && user?.avatarUrl.trim() !== "") ? (
                  <img
                    src={avatarPreview || user?.avatarUrl}
                    className="w-full h-full rounded-full object-cover border-4 border-indigo-50 dark:border-slate-600"
                    alt="avatar"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-3xl">
                    <FaUser />
                  </div>
                )}
                <div
                  className={`absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md transition-opacity duration-200 ${
                    isHovering ? "opacity-100" : "opacity-0 lg:opacity-100"
                  }`}
                >
                  <FaCamera size={12} />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {user?.name}
              </h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>

            {/* Menu Navigation */}
            <nav className="bg-white dark:bg-[#2E2E33] rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-6 py-4 font-medium flex justify-between items-center border-b border-gray-100 dark:border-slate-700 last:border-0 transition-colors duration-200
                    ${
                      activeTab === tab.id
                        ? "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:text-indigo-400 border-l-4 border-l-indigo-600"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 border-l-transparent"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </div>
                  <span className="text-gray-400 text-xl">›</span>
                </button>
              ))}
            </nav>
          </div>

          {/* --- CỘT PHẢI (Nội dung thay đổi theo Tab) --- */}
          <div className="lg:col-span-8">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
