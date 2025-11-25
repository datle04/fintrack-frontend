import { FiArrowUpRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import LogoF from "../assets/img/logo.webp";
import Laptop from "../assets/img/Laptop.png";

export default function LandingPage() {
  return (
    <div
      className="flex flex-col min-h-screen overflow-x-hidden"
      id="landingpage"
    >
      <main className="flex-1 h-full bg-gradient-to-b from-white via-white to-[#373ecb] xl:bg-none max-w-[1536px] mx-auto w-full">
        {/* Header */}
        <header className="w-full px-4 md:px-12 lg:px-20 xl:px-24 py-6 flex items-center justify-between max-w-[1536px] mx-auto">
          <a href="#" className="flex items-start group 3xl:-ml-45">
            <div className="flex items-center">
              <img
                src={LogoF}
                alt="Landingpage logo"
                className="h-20 rounded-full mr-1"
              />
            </div>
          </a>

          <div className="flex space-x-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-gray-800 text-sm font-bold bg-[#dad7ff] hover:bg-[#8f87ff] transition 3xl:text-xl"
            >
              Sign in
            </Link>
            <Link
              to="/login?mode=register"
              className="px-4 py-2 rounded-full text-gray-800 text-sm font-bold bg-[#dad7ff] hover:bg-[#8f87ff] transition 3xl:text-xl 3xl:-mr-15"
            >
              Register
            </Link>
          </div>
        </header>

        {/* Nội dung chính */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-10 px-6 md:px-12 lg:px-20 xl:px-24 py-8 flex-grow max-w-[1536px] mx-auto w-full">
          {/* Text */}
          <div className="w-full md:w-1/2 px-2 md:px-4 lg:px-10">
            <h1 className="font-notosans font-bold leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-7xl 3xl:text-8xl text-gray-900 3xl:mr-20">
              <span className="block">SmartExpense</span>
              <span className="block items-center whitespace-nowrap">
                Tracking<span className="ml-1">,</span>
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-violet-200 p-1">
                  <FiArrowUpRight style={{ fontSize: "40px" }} />
                </span>
              </span>
              <span className="block mt-2 text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-7xl">
                Simplified
              </span>
            </h1>

            <p className="font-mono text-md md:text-xl text-gray-700 max-w-xl mt-6 lg:text-xl 3xl:text-2xl 3xl:mr-20 ">
              Empower your team with seamless, cloud-based tools <br />
              designed to enhance productivity, collaboration, and <br />
              efficiency.
            </p>
          </div>

          {/* Bên phải - Hình ảnh */}
          <div className="h-auto w-full md:w-1/2 flex justify-center items-center relative 3xl:mt-10">
            {/* Gradient (ẩn ở mobile) */}
            <div
              className="hidden xl:block absolute rounded-[2rem] bg-gradient-to-b from-[#8f88ff] to-white 3xl:ml-10 "
              style={{
                width: "450px",
                height: "500px",
                zIndex: 0,
                bottom: "-30%",
                left: "98%",
                transform: "translateX(-90%)",
              }}
            />

            {/* Hình ảnh */}
            <img
              src={Laptop}
              alt="Laptop và Điện thoại"
              className="
    w-full
    max-w-xs sm:max-w-sm md:max-w-md
    lg:max-w-lg xl:max-w-xl 3xl:max-w-2xl
    drop-shadow-xl
    relative
    mt-8
    mx-auto
    3xl:ml-10
  "
            />
          </div>
        </section>
      </main>
    </div>
  );
}
