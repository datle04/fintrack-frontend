import { useState, useRef } from "react";
import { Eye, EyeOff, Mail, User, Lock, ArrowRight } from "lucide-react";
import phoneImg from "../assets/img/phoneImg.png"; // Đảm bảo đường dẫn ảnh đúng
import LogoF from "../assets/img/logo.webp"; // Đảm bảo đường dẫn logo đúng
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError } from "../features/authSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useLoading } from "../context/LoadingContext";
import InputField from "../components/LoginPageComponent/InputField";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { setIsAppLoading } = useLoading();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      loading: isRegister ? "Đang tạo tài khoản..." : "Đang đăng nhập...",
      success: {
        render: isRegister ? "Đăng ký thành công!" : "Đăng nhập thành công!",
        duration: 5000, // 5 giây nè, muốn bao nhiêu chơi bấy nhiêu
      },
      error: (err) => {
        console.log("Lỗi trả về:", err);
        if (typeof err === "object" && err !== null && err.message) {
          return err.message;
        }
        return err || "Có lỗi xảy ra!";
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
        }, 1500); // Giảm thời gian chờ xuống chút cho mượt
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
            {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại!"}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {isRegister
              ? "Bắt đầu quản lý tài chính thông minh ngay hôm nay."
              : "Đăng nhập để tiếp tục hành trình của bạn."}
          </p>
        </div>

        {/* Form Mobile */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {isRegister && (
            <InputField
              label="Họ và Tên"
              icon={User}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
            />
          )}

          <InputField
            label="Email"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />

          <InputField
            label="Mật khẩu"
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
            {isRegister ? "Đăng ký ngay" : "Đăng nhập"}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Mobile */}
        <p className="mt-8 text-center text-sm text-gray-600">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="ml-2 font-semibold text-indigo-600 cursor-pointer hover:text-indigo-700 hover:underline transition-colors"
          >
            {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
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
              {isRegister ? "Tạo tài khoản" : "Chào mừng trở lại"}
            </h1>
            <p className="text-gray-500 text-lg">
              {isRegister
                ? "Nhập thông tin của bạn để bắt đầu miễn phí."
                : "Vui lòng nhập thông tin đăng nhập của bạn."}
            </p>
          </div>

          {/* Desktop Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {isRegister && (
              <InputField
                label="Họ và Tên"
                icon={User}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
              />
            )}

            <InputField
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />

            <div className="space-y-2">
              <InputField
                label="Mật khẩu"
                icon={Lock}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                isPassword
              />
              {!isRegister && (
                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-sm text-indigo-600 font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-4 bg-indigo-600 cursor-pointer hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
            </button>
          </form>

          {/* Desktop Footer */}
          <p className="mt-8 text-center text-gray-600">
            {isRegister ? "Bạn đã là thành viên?" : "Bạn mới sử dụng FinTrack?"}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 hover:underline transition-colors"
            >
              {isRegister ? "Đăng nhập ngay" : "Tạo tài khoản"}
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
            {/* Floating Glass Cards (Trang trí) */}
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
                    Thu nhập
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
                    Chi tiêu
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
                Quản lý tài chính thông minh
              </h2>
              <p className="text-indigo-100 text-lg leading-relaxed">
                Theo dõi thu chi, lập ngân sách và đạt được mục tiêu tài chính
                của bạn dễ dàng hơn bao giờ hết.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
