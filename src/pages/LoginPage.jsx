import { useState } from "react";
import { Eye, EyeOff, Mail, User, Lock, ArrowRight } from "lucide-react";
import phoneImg from "../assets/img/phoneImg.png";
import LogoF from "../assets/img/logo.webp";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError } from "../features/authSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useLoading } from "../context/LoadingContext";
import InputField from "../components/LoginPageComponent/InputField";
import { useTranslation } from "react-i18next"; // 1. Import hook

export default function LoginPage() {
  const { t } = useTranslation(); // 2. Khởi tạo hook
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { setIsAppLoading } = useLoading();

  const [isRegister, setIsRegister] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = isRegister
      ? registerUser({ email, name, password })
      : loginUser({ email, password });

    const action = dispatch(payload).unwrap();

    toast.promise(action, {
      loading: isRegister
        ? t("loginPage.toast.registerLoading")
        : t("loginPage.toast.loginLoading"),
      success: isRegister
        ? t("loginPage.toast.registerSuccess")
        : t("loginPage.toast.loginSuccess"),
      error: (err) => {
        console.log("Lỗi trả về:", err);
        if (typeof err === "object" && err !== null && err.message) {
          return err.message;
        }
        return err || t("loginPage.toast.defaultError");
      },
    });

    try {
      await action;

      if (isRegister) {
        setIsRegister(false); // Chuyển về login sau khi đăng ký
      } else {
        // Login thành công
        setIsAppLoading(true);
        setTimeout(() => {
          if (user?.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/dashboard");
          }
          setIsAppLoading(false);
        }, 1500);
      }

      // Reset form
      setEmail("");
      setName("");
      setPassword("");
    } catch (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* ================= MOBILE LAYOUT ================= */}
      <div className="lg:hidden min-h-screen flex flex-col justify-center px-6 py-8 relative bg-gradient-to-b from-indigo-50/50 to-white">
        {/* Header Mobile */}
        <div className="mb-8 text-center">
          <img
            src={LogoF}
            alt="Logo"
            className="h-16 mx-auto mb-4 drop-shadow-sm"
          />
          <h2 className="text-2xl font-bold text-gray-900">
            {isRegister
              ? t("loginPage.mobile.headerRegister")
              : t("loginPage.mobile.headerLogin")}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {isRegister
              ? t("loginPage.mobile.subHeaderRegister")
              : t("loginPage.mobile.subHeaderLogin")}
          </p>
        </div>

        {/* Form Mobile */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {isRegister && (
            <InputField
              label={t("loginPage.form.nameLabel")}
              icon={User}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("loginPage.form.namePlaceholder")}
            />
          )}

          <InputField
            label={t("loginPage.form.emailLabel")}
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("loginPage.form.emailPlaceholder")}
          />

          <InputField
            label={t("loginPage.form.passwordLabel")}
            icon={Lock}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            isPassword
          />

          <button
            type="submit"
            className="mt-4 w-full py-3.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {isRegister
              ? t("loginPage.button.register")
              : t("loginPage.button.login")}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Mobile */}
        <p className="mt-8 text-center text-sm text-gray-600">
          {isRegister
            ? t("loginPage.footer.hasAccount")
            : t("loginPage.footer.noAccount")}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="ml-2 font-semibold text-indigo-600 cursor-pointer hover:text-indigo-700 hover:underline transition-colors"
          >
            {isRegister
              ? t("loginPage.footer.loginLink")
              : t("loginPage.footer.registerLink")}
          </button>
        </p>
      </div>

      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="hidden lg:flex min-h-screen w-full overflow-hidden">
        {/* LEFT COLUMN: Form & Content (40%) */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-16 xl:px-24 bg-white relative z-20">
          {/* Logo Alignment */}
          <div className="mb-12">
            <img src={LogoF} alt="FinTrack Logo" className="h-14 w-auto" />
          </div>

          {/* Text Heading */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              {isRegister
                ? t("loginPage.desktop.headerRegister")
                : t("loginPage.desktop.headerLogin")}
            </h1>
            <p className="text-gray-500 text-lg">
              {isRegister
                ? t("loginPage.desktop.subHeaderRegister")
                : t("loginPage.desktop.subHeaderLogin")}
            </p>
          </div>

          {/* Desktop Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {isRegister && (
              <InputField
                label={t("loginPage.form.nameLabel")}
                icon={User}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("loginPage.form.namePlaceholder")}
              />
            )}

            <InputField
              label={t("loginPage.form.emailLabel")}
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("loginPage.form.emailPlaceholder")}
            />

            <div className="space-y-2">
              <InputField
                label={t("loginPage.form.passwordLabel")}
                icon={Lock}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("loginPage.form.passwordPlaceholderDesktop")}
                isPassword
              />
              {!isRegister && (
                <div className="flex justify-end">
                  <a
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline"
                  >
                    {t("loginPage.link.forgotPassword")}
                  </a>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-4 bg-indigo-600 cursor-pointer hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isRegister
                ? t("loginPage.button.registerLong")
                : t("loginPage.button.login")}
            </button>
          </form>

          {/* Desktop Footer */}
          <p className="mt-8 text-center text-gray-600">
            {isRegister
              ? t("loginPage.desktop.footerHasAccount")
              : t("loginPage.desktop.footerNoAccount")}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 hover:underline transition-colors"
            >
              {isRegister
                ? t("loginPage.desktop.footerLoginLink")
                : t("loginPage.desktop.footerRegisterLink")}
            </button>
          </p>
        </div>

        {/* RIGHT COLUMN: Visuals (60%) */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative items-center justify-center overflow-hidden">
          {/* Abstract Shapes Background */}
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-400 opacity-10 rounded-full blur-3xl"></div>

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>

          {/* Main Content Container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Floating Glass Cards */}
            <div
              className="absolute -left-20 top-20 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-xl">
                  💰
                </div>
                <div>
                  <p className="text-indigo-100 text-xs font-medium">
                    {t("loginPage.visuals.income")}
                  </p>
                  <p className="text-white font-bold">+ 25.000.000đ</p>
                </div>
              </div>
            </div>

            <div
              className="absolute -right-10 bottom-40 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl animate-bounce"
              style={{ animationDuration: "4s", animationDelay: "1s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white font-bold text-xl">
                  🛍️
                </div>
                <div>
                  <p className="text-indigo-100 text-xs font-medium">
                    {t("loginPage.visuals.expense")}
                  </p>
                  <p className="text-white font-bold">- 500.000đ</p>
                </div>
              </div>
            </div>

            {/* Phone Image */}
            <img
              src={phoneImg}
              alt="App Preview"
              className="w-[400px] xl:w-[500px] drop-shadow-[0_35px_60px_rgba(0,0,0,0.5)] transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out"
            />

            {/* Text Slogan */}
            <div className="mt-12 text-center max-w-md">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t("loginPage.visuals.sloganTitle")}
              </h2>
              <p className="text-indigo-100 text-lg leading-relaxed">
                {t("loginPage.visuals.sloganDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
