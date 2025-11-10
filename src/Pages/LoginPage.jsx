import { useState, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import phoneImg from "../assets/img/phoneImg.png";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError } from "../features/authSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import LogoF from "../assets/img/logo.webp";
import { useLoading } from "../context/LoadingContext";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { setIsAppLoading } = useLoading();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const toastId = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = isRegister
      ? registerUser({ email, name, password })
      : loginUser({ email, password });

    const action = dispatch(payload).unwrap();

    toast.promise(action, {
      loading: isRegister ? "Đang tạo tài khoản..." : "Đang đăng nhập...",
      success: isRegister ? "Đăng ký thành công!" : "Đăng nhập thành công!",
      error: (err) => err || "Có lỗi xảy ra!",
    });

    try {
      await action;

      // Nếu là đăng ký → chuyển sang màn login
      if (isRegister) {
        setIsRegister(false);
      } else {
        // Nếu là login → navigate tuỳ role
        setIsAppLoading(true);
        setTimeout(() => {
          if (user?.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/dashboard");
          }
          setIsAppLoading(false);
        }, 3000);
      }

      // Reset form
      setEmail("");
      setName("");
      setPassword("");
    } catch (error) {
      dispatch(clearError());
      // Không cần toast.error ở đây nữa vì toast.promise lo hết rồi
    }
  };

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen flex flex-col bg-linear-to-b from-[#8f88ff] to-white">
        <header className="w-full flex items-center gap-2 px-4 py-3">
          <a href="#" className="flex items-start group">
            <div className="flex items-center">
              <img
                src={LogoF}
                alt="Landingpage logo"
                className="h-20  rounded-full mr-1"
              />
            </div>
          </a>
        </header>

        <div className="flex flex-col items-center justify-center grow px-4">
          <img
            src={phoneImg}
            alt="Phone"
            className="w-60 mt-4 mb-4 select-none pointer-events-none"
          />
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg px-4 py-3 bg-white outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400 placeholder-gray-500"
              required
            />
            {isRegister && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-lg px-4 py-3 bg-white outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400 placeholder-gray-500"
                required
              />
            )}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg px-4 py-3 bg-white outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400 placeholder-gray-500 pr-12 cursor-pointer"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-sm text-gray-700 text-center">
              {isRegister
                ? "Already have an account? "
                : "You don't have an account yet?"}
              <span
                onClick={() => setIsRegister((prev) => !prev)}
                className="font-semibold text-indigo-600 cursor-pointer hover:underline"
              >
                {isRegister ? "Login" : "Register"}
              </span>
            </p>
            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-indigo-200 hover:bg-indigo-300 active:bg-indigo-400 py-3 text-gray-800 font-medium transition"
            >
              {isRegister ? "Register" : "Login"}
            </button>
          </form>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex min-h-screen w-full relative overflow-hidden">
        <div className="absolute top-6 left-6 flex items-center z-20">
          <img
            src={LogoF}
            alt="Logo"
            className="h-20 rounded-full ml-18 mb-300"
          />
        </div>
        {/* Left Column */}
        <div className="w-1/2 flex flex-col items-center justify-center px-20 bg-white lg:pl-15 lg:pr-0">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg flex flex-col gap-6 pt-12 mb-25 ml-15"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg px-4 py-3 bg-white outline-none placeholder-gray-500 text-lg border-2 border-black-600 3xl:text-2xl"
              required
            />
            {isRegister && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-lg px-4 py-3 bg-white outline-none placeholder-gray-500 text-lg border-2 border-black-600 3xl:text-2xl"
                required
              />
            )}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg px-4 py-3 bg-white outline-none placeholder-gray-500 text-lg border-2 border-black-600 3xl:text-2xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer 3xl:text-xl"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-sm text-gray-700 3xl:text-xl">
              {isRegister
                ? "Already have an account? "
                : "You don't have an account yet ? "}
              <span
                onClick={() => setIsRegister((prev) => !prev)}
                className="font-semibold text-indigo-600 cursor-pointer hover:underline"
              >
                {isRegister ? "Login" : "Register"}
              </span>
            </p>
            <div className="flex justify-end">
              <button
                type="submit"
                className="w-fit px-6 py-2 rounded-xl bg-indigo-200 hover:bg-indigo-300 active:bg-indigo-400 text-gray-800 font-medium transition text-base cursor-pointer 3xl:text-xl"
              >
                {isRegister ? "Register" : "Sign in"}
              </button>
            </div>
          </form>
        </div>
        {/* Right Column */}
        <div className="relative mt-[5%] mr-[5%] ml-[20%] rounded-4xl border-gray-300 bg-gradient-to-b from-[#8f88ff] to-white flex items-center justify-center lg:w-1/2">
          <img
            src={phoneImg}
            alt="Phone"
            className="w-[320px] lg:w-[450px] drop-shadow-2xl md:absolute md:-left-50 md:z-100"
          />
          <div className="absolute top-20 left-20 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white bg-opacity-10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </>
  );
}
