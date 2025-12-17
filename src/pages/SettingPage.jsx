import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaUserCircle, FaShieldAlt, FaPalette } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo, logoutUser, updateUser } from "../features/authSlice";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import EditableField from "../components/EditableField";
import { currencyMap } from "../constant/currencies";
import SettingPageLoading from "../components/Loading/SettingLoading/SettingPageLoading";
import ChangePasswordSection from "../components/ChangePasswordSection";
import { getDirtyValues } from "../utils/formUtils";

const SettingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState("profile");
  const [language, setLanguage] = useState(
    localStorage.getItem("lang") || "vi"
  );

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    currency: "VND",
    dob: "",
    address: "",
  });

  const initialProfile = useRef(profile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [errors, setErrors] = useState({});

  // --- 1. CLEANUP MEMORY LEAK (AVATAR) ---
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Đồng bộ User từ Redux vào State
  useEffect(() => {
    if (user) {
      const newProfileState = {
        name: user.name || "",
        phone: user.phone || "",
        currency: user.currency || "VND",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "", // Format lại date cho input type="date"
        address: user.address || "",
      };
      setProfile(newProfileState);
      initialProfile.current = newProfileState;
      setAvatarPreview(null);
    } else {
      dispatch(getUserInfo());
    }
  }, [user, dispatch]);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("lang", language);
  }, [language, i18n]);

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(profile) !== JSON.stringify(initialProfile.current) ||
      avatarFile !== null
    );
  }, [profile, avatarFile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate ảnh (Option)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh đại diện không được quá 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
    // --- 2. RESET INPUT VALUE ĐỂ CHỌN LẠI ĐƯỢC ẢNH CŨ ---
    e.target.value = null;
  };

  const validateUserProfile = (currentProfile) => {
    const newErrors = {};
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;

    if (!currentProfile.name || !currentProfile.name.trim()) {
      newErrors.name = t("validate.nameRequired") || "Tên không được để trống";
    } else if (currentProfile.name.length < 2) {
      newErrors.name =
        t("validate.nameMinLength") || "Tên phải có ít nhất 2 ký tự";
    }

    if (currentProfile.phone && !phoneRegex.test(currentProfile.phone)) {
      newErrors.phone =
        t("validate.phoneInvalid") || "Số điện thoại không hợp lệ";
    }

    if (currentProfile.dob) {
      const selectedDate = new Date(currentProfile.dob);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dob =
          t("validate.dobFuture") || "Ngày sinh không được ở tương lai";
      }
    }
    return newErrors;
  };

  const handleSaveProfile = () => {
    setErrors({});
    const newErrors = validateUserProfile(profile);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("validate.checkForm") || "Vui lòng kiểm tra lại thông tin");
      return;
    }

    if (!isDirty) return;

    const dirtyFields = getDirtyValues(initialProfile.current, profile);
    const hasAvatarChange = !!avatarFile;

    if (Object.keys(dirtyFields).length === 0 && !hasAvatarChange) return;

    const formData = new FormData();
    Object.keys(dirtyFields).forEach((key) => {
      formData.append(key, dirtyFields[key]);
    });

    if (hasAvatarChange) {
      formData.append("avatar", avatarFile);
    }

    const promise = dispatch(updateUser(formData)).unwrap();

    toast
      .promise(promise, {
        loading: t("saving"),
        success: () => {
          setAvatarFile(null);
          return <b>{t("saveSuccess")}</b>;
        },
        error: (err) => <b>{`${t("saveError")}: ${err?.message || "Lỗi"}`}</b>,
      })
      .catch((err) => console.error("Lỗi update:", err));
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

  const tabs = useMemo(
    () => [
      { id: "profile", label: t("userInfo"), icon: <FaUserCircle /> },
      { id: "security", label: t("security"), icon: <FaShieldAlt /> },
      { id: "interface", label: t("interface"), icon: <FaPalette /> },
    ],
    [t]
  );

  // --- HÀM HELPER ĐỂ RENDER INPUT (Tránh lặp code & Xử lý xóa lỗi) ---
  const renderField = (key, label, type = "text") => (
    <div>
      <EditableField
        label={label}
        value={profile[key]}
        type={type}
        onChange={(e) => {
          setProfile({ ...profile, [key]: e.target.value });
          // --- 3. XÓA LỖI KHI NGƯỜI DÙNG NHẬP LẠI ---
          if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
        }}
      />
      {errors[key] && (
        <p className="text-red-500 text-xs mt-1 ml-1 animate-fadeIn">
          {errors[key]}
        </p>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700 animate-fadeIn">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
        {t("security")}
      </h3>
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
            {t("email")}
          </label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
          />
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <ChangePasswordSection logoutOnSuccess={true} />
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

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              {t("userInfo")}
            </h3>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                loading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {renderField("name", t("name"))}
              {renderField("phone", t("phone"))}
              {renderField("dob", t("dob"), "date")}
              {renderField("address", t("address"))}

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
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#3a3a41] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                >
                  {[...currencyMap].map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={!isDirty || loading}
                className={`px-8 py-2.5 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isDirty && !loading
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                )}
                {t("save")}
              </button>
            </div>
          </div>
        );

      case "security":
        return renderSecurityTab();

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

  if (!user) return <SettingPageLoading />;

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {t("setting")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 shadow-sm text-center border border-gray-100 dark:border-slate-700">
              <div
                className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <img
                  src={
                    avatarPreview ||
                    user?.avatarUrl ||
                    "https://ui-avatars.com/api/?name=" + (user?.name || "User")
                  }
                  className="w-full h-full rounded-full object-cover border-4 border-indigo-50 dark:border-slate-600"
                  alt="avatar"
                  onError={(e) => {
                    e.target.src =
                      "https://ui-avatars.com/api/?name=" +
                      (user?.name || "User");
                  }}
                />
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

          {/* CỘT PHẢI */}
          <div className="lg:col-span-8">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
