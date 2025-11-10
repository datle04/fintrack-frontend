import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaGlobe,
  FaImage,
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

  const [language, setLanguage] = useState(
    localStorage.getItem("lang") || "vi"
  );

  const [profile, setProfile] = useState({
    name: user.name,
    phone: user.phone,
    currency: user.currency || "VND",
    dob: user.dob,
    address: user.address,
  });
  const initialProfile = useRef(profile);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
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
    dispatch(getUserInfo());
  }, []);

  const handleSaveProfile = () => {
    if (!isDirty) return;

    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("phone", profile.phone);
    formData.append("currency", profile.currency);
    formData.append("dob", profile.dob);
    formData.append("address", profile.address);
    if (avatarFile) formData.append("avatar", avatarFile);

    // 1. Định nghĩa promise
    const promise = dispatch(updateUser(formData)).unwrap();

    // 2. Gọi toast.promise
    toast
      .promise(promise, {
        // 3. Các thông báo
        loading: t("saving", "Đang lưu..."),
        success: <b>{t("saveSuccess", "Đã lưu thông tin!")}</b>,
        error: (err) => (
          <b>{`${t("saveError", "Lỗi khi lưu")}: ${err.message || err}`}</b>
        ),
      })
      .then(() => {
        // 4. Xử lý logic sau khi thành công
        initialProfile.current = profile;
        setAvatarFile(null);
      })
      .catch((err) => {
        // 5. Thêm catch rỗng để tránh lỗi "Unhandled promise rejection"
        // (Toast đã tự hiển thị lỗi rồi)
      });
  };

  const handleLogout = async () => {
    const logoutPromise = dispatch(logoutUser()).unwrap();

    toast.promise(logoutPromise, {
      loading: "Đang đăng xuất...",
      success: "Đã đăng xuất! 👋",
      error: (err) => err?.message || "Đăng xuất thất bại!",
    });

    logoutPromise.finally(() => {
      navigate("/login");
    });
  };

  return (
    <div className="h-fit flex items-start justify-center bg-[#f3f4f6] sm:h-full xl:items-center dark:bg-[#35363A]">
      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mx-auto dark:border dark:border-slate-700 dark:bg-[#2E2E33] dark:text-white/83">
          <h2 className="text-2xl font-semibold mb-8">{t("setting")}</h2>

          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
            {/* === Thông tin người dùng === */}
            <section className="flex-1 w-full sm:px-3">
              <h3 className="w-full text-center text-lg font-semibold mb-4 sm:text-left">
                {t("userInfo")}
              </h3>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="relative h-20 w-20 rounded-full overflow-hidden cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  title="Đổi ảnh"
                >
                  {avatarPreview ||
                  (user?.avatarUrl && user.avatarUrl.trim() !== "") ? (
                    <img
                      src={avatarPreview || user.avatarUrl}
                      alt="avatar"
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#7e5bef] flex items-center justify-center">
                      <FaUser className="text-white text-3xl" />
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 bg-gray-800/70 flex items-center justify-center rounded-full z-10 transition-opacity duration-300 ${
                      isHovering ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <FaImage className="text-white text-2xl" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Các trường chỉnh sửa */}
              <div className="space-y-4">
                <EditableField
                  label={t("name")}
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <EditableField
                  label={t("phone")}
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
                <EditableField
                  label={t("dob")}
                  value={profile.dob}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, dob: e.target.value }))
                  }
                />
                <EditableField
                  label={t("address")}
                  value={profile.address}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
                {/* --- BẮT ĐẦU THÊM MỚI --- */}
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
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
                    className="w-full px-2 py-1 border-b border-gray-400 bg-transparent outline-none cursor-pointer dark:bg-[#2E2E33]"
                  >
                    {[...currencyMap].map(([code, label]) => (
                      <option
                        key={code}
                        value={code}
                        className="dark:bg-[#2E2E33]"
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* --- KẾT THÚC THÊM MỚI --- */}
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-2 py-1 border-b border-gray-400 bg-transparent outline-none cursor-not-allowed"
                  />
                </div>

                <div className="relative select-none">
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    {t("password")}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value="123456"
                    readOnly
                    className="w-full px-2 py-1 border-b border-gray-400 bg-transparent pr-8 outline-none cursor-not-allowed"
                  />
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-1 text-gray-600 hover:text-indigo-600"
                    onClick={() => setShowPassword((s) => !s)}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={!isDirty}
                  className={`block text-center w-full py-2 rounded-md transition-colors ${
                    isDirty
                      ? "bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } dark:bg-indigo-600 dark:hover:bg-indigo-700`}
                >
                  {t("save")}
                </button>
              </div>
            </section>

            {/* Cài đặt giao diện */}
            <div className="hidden md:block w-px bg-gray-300 self-stretch" />
            <section className="w-full my-3 flex-1 md:mt-0">
              <h3 className="text-lg font-semibold mb-4 text-left">
                {t("interface")}
              </h3>

              <label className="block mb-2 font-medium text-left w-full">
                {t("theme")}
              </label>
              <div className="flex space-x-6 mb-6">
                {["light", "dark"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={opt}
                      checked={theme === opt}
                      onChange={toggleTheme}
                      className="accent-purple-500"
                    />
                    <span>{opt === "light" ? t("light") : t("dark")}</span>
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <label className="flex items-center space-x-2 mb-2 font-medium cursor-pointer">
                  <span>{t("language")}</span>
                  <FaGlobe />
                </label>
                <select
                  className="w-full border px-3 py-2 rounded-md"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option className="dark:bg-[#2E2E33]" value="vi">
                    Tiếng Việt
                  </option>
                  <option className="dark:bg-[#2E2E33]" value="en">
                    English
                  </option>
                </select>
              </div>

              <button
                onClick={handleLogout}
                className="block text-center w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition-colors cursor-pointer dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                {t("logout")}
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingPage;
