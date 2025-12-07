import React, { useEffect, useRef, useState } from "react";
import logoLight from "../assets/img/logo.webp";
import { TfiMenuAlt } from "react-icons/tfi";
import SidebarComponent from "./SideBarComponent";
import { IoNotifications } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  addNewNotification,
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
} from "../features/notificationSlice";
import formatDateToString from "../utils/formatDateToString";
import gsap from "gsap";
import adminLogo from "../assets/img/admin_logo.webp";
import logoDark from "../assets/img/logo_dark.webp";
import { useTheme } from "../context/ThemeContext";
import { io } from "socket.io-client";
import { connectSocket } from "../utils/socket";
import toast from "react-hot-toast";
import notificationSound from "../assets/audio/notification.mp3";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { theme } = useTheme();

  const notifications = useSelector(
    (state) => state.notification.notifications
  );
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.notification.loading);
  const [logo, setLogo] = useState("");
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [toggleNotification, setToggleNotification] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const isConnecting = useRef(false);

  const notiRef = useRef();

  // --- 1. LOGIC "MỞ KHÓA" ÂM THANH ---
  useEffect(() => {
    const unlockAudio = () => {
      // Tạo một âm thanh rỗng/ngắn để "mồi" trình duyệt
      const audio = new Audio(notificationSound);
      audio.volume = 0; // Tắt tiếng để user không nghe thấy

      // Thử phát và dừng ngay lập tức
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          console.log("🔊 Audio Context Unlocked!");
        })
        .catch((e) => {
          // Vẫn bị chặn thì kệ nó, chờ lần click sau
        });

      // Chỉ cần làm 1 lần duy nhất, sau đó gỡ sự kiện ra
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };

    // Lắng nghe tương tác đầu tiên của user
    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  // --- USE EFFECT CHO SOCKET ---
  useEffect(() => {
    // Chỉ kết nối nếu có user ID
    if (!user?.id) return;
    if (isConnecting.current) return;

    isConnecting.current = true;

    // 1. Gọi hàm connect từ utils (truyền userId)
    const socket = connectSocket(user.id);
    console.log("CLIENT SOCKET ID:", socket.id);

    // 2. Lắng nghe sự kiện 'new_notification'
    // Lưu ý: Dùng .off trước để tránh đăng ký trùng lặp khi re-render
    socket.off("new_notification").on("new_notification", (newNoti) => {
      console.log("🔔 [FRONTEND] RECEIVED EVENT:", newNoti);

      // A. Cập nhật Redux
      dispatch(addNewNotification(newNoti));

      // --- A. XỬ LÝ ÂM THANH ---
      try {
        // Cách 1: Dùng file local (Khuyên dùng)
        const audio = new Audio(notificationSound);

        // Cách 2: Dùng link online (Để test nhanh nếu chưa có file)
        // const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

        audio.volume = 0.5; // Chỉnh âm lượng (0.0 đến 1.0)
        audio
          .play()
          .catch((err) =>
            console.error("Trình duyệt chặn tự động phát âm thanh:", err)
          );
      } catch (error) {
        console.error("Lỗi âm thanh:", error);
      }

      // --- B. XỬ LÝ ANIMATION (Timeline) ---
      if (!toggleNotification) {
        // Tạo một timeline mới để các hành động diễn ra nối tiếp/đồng thời
        const tl = gsap.timeline();

        tl.to(".bell-icon", {
          scale: 1.2, // 1. Phóng to lên 1.2 lần
          duration: 0.1,
          ease: "power1.out",
        })
          .to(".bell-icon", {
            rotation: 15, // 2. Bắt đầu rung (nghiêng sang phải trước)
            duration: 0.05,
            ease: "linear",
          })
          .to(".bell-icon", {
            rotation: -15, // 3. Rung qua lại
            duration: 0.1,
            repeat: 5, // Lặp lại 5 lần (tạo hiệu ứng rung)
            yoyo: true, // Quay ngược lại
            ease: "linear",
          })
          .to(".bell-icon", {
            scale: 1, // 4. Kết thúc: Thu về kích thước cũ
            rotation: 0, //    VÀ Trả về góc 0 độ (thẳng đứng)
            duration: 0.2,
            ease: "elastic.out(1, 0.3)", // Hiệu ứng đàn hồi nhẹ khi dừng
          });
      }
    });

    // 3. Logic duy trì session (Heartbeat 30s)
    const interval = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit("session.update", { userId: user.id });
      }
    }, 30_000);

    // 4. Cleanup khi unmount
    return () => {
      clearInterval(interval);
      // Tắt lắng nghe sự kiện cụ thể
      isConnecting.current = false;
      socket.off("new_notification");

      // Nếu user đăng xuất (user._id thay đổi thành null), ngắt kết nối
      // disconnectSocket(); // (Tùy chọn: Uncomment nếu muốn ngắt hẳn khi Header unmount)
    };
  }, [user?.id]);

  useEffect(() => {
    if (theme === "light") {
      setLogo(logoLight);
    } else {
      setLogo(logoDark);
    }
  }, [theme]);

  useEffect(() => {
    if (toggleNotification) {
      gsap.fromTo(
        notiRef.current,
        { autoAlpha: 0, y: -10 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    } else {
      if (notiRef.current) {
        gsap.to(notiRef.current, {
          autoAlpha: 0,
          y: -10,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    }
  }, [toggleNotification]);

  useEffect(() => {
    if (window.innerWidth >= 1024) setToggleSidebar(true);
  }, [window.innerWidth]);

  useEffect(() => {
    dispatch(getNotifications());
  }, []);

  const toggleNoti = () => {
    if (toggleNotification) {
      gsap.to(notiRef.current, {
        autoAlpha: 0,
        y: -10,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => setToggleNotification(false),
      });
    } else {
      setToggleNotification(true);
      if (notiRef.current) {
        gsap.to(notiRef.current, {
          autoAlpha: 0,
          y: -10,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    }

    // setToggleNotification((prev) => !prev);

    if (
      toggleNotification &&
      notifications.some((item) => item.isRead === false)
    ) {
      notifications?.forEach(async (item) => {
        await dispatch(markNotificationAsRead(item._id));
      });
    }
  };

  const generateNotificationTitle = (type) => {
    switch (type) {
      case "budget_warning":
        return "🚨 Chi tiêu vượt ngân sách";
      case "budget_category_warning":
        return "📢 Danh mục sắp hết ngân sách";
      case "reminder":
        return "⏰ Nhắc nhở tài chính";
      case "info":
      default:
        return "ℹ️ Thông báo hệ thống";
    }
  };

  // 3. THÊM HÀM XỬ LÝ XÓA TẤT CẢ
  const handleClearAllNotifications = async (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài làm đóng dropdown

    if (notifications.length === 0) return;

    // Xác nhận đơn giản (Tùy chọn)
    // if (!window.confirm("Bạn có chắc muốn xóa tất cả thông báo?")) return;

    try {
      // Dispatch action xóa (Bạn cần đảm bảo action này đã được viết trong slice)
      // Nếu chưa có action trong slice, bạn có thể tạm thời set state rỗng ở đây nếu chỉ muốn test UI
      await dispatch(deleteAllNotifications()).unwrap();

      toast.success("Đã xóa tất cả thông báo");
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      // toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  const highlightPercent = (message) => {
    const match = message.match(/(\d+)%/);
    if (!match) return message;

    const percentStr = match[0];
    const percent = parseInt(match[1]);
    const percentIndex = match.index;

    const before = message.slice(0, percentIndex);
    const after = message.slice(percentIndex + percentStr.length);

    let colorClass = "";
    let icon = "✅"; // mặc định

    if (percent >= 100) {
      colorClass = "text-red-500 font-semibold";
      icon = "🔥";
    } else if (percent >= 80) {
      colorClass = "text-orange-500 font-semibold";
      icon = "⚠️";
    }

    return (
      <>
        {before}
        <span className={colorClass}>
          {icon}
          {percentStr}
        </span>
        {after}
      </>
    );
  };

  return (
    <div
      className="
          relative w-full h-20 px-6 flex justify-between items-center border border-slate-300 dark:bg-[#2B2B2F] dark:border-0 
          sm:h-25 sm:px-10 
          md:px-15
          lg:px-5 lg:h-20 lg:pb-2
    "
    >
      <img
        src={user?.role === "admin" ? adminLogo : logo}
        className={`
          ${
            user?.role === "admin"
              ? "max-w-30 sm:max-w-32 md:max-w-35"
              : "max-w-20 sm:max-w-22 md:max-w-23 dark:max-w-32 sm:dark:max-w-35 md:dark:max-w-38"
          }
        `}
      />
      <div
        className="
          h-full flex justify-center items-center gap-3
          md:gap-5
      "
      >
        <div className="relative xl:mx-3 2xl:mx-5 3xl:mx-10">
          <div
            onClick={toggleNoti}
            className={`
              p-2 rounded-full hover:bg-slate-200 cursor-pointer dark:hover:bg-[#514D73] ${
                toggleNotification
                  ? "bg-slate-200 dark:bg-[#514D73]"
                  : "bg-transparent"
              }
          `}
          >
            <IoNotifications
              className={`text-xl text-[#514D73] lg:text-2xl 3xl:text-3xl dark:text-white/90 bell-icon`}
            />
            {notifications.some((item) => item.isRead === false) && (
              <div className="absolute top-[15%] right-[10%] p-1 rounded-full bg-red-500"></div>
            )}
          </div>
          {toggleNotification && (
            <div
              ref={notiRef}
              className="
                absolute top-full -right-[130%] h-90 w-75 mt-2 flex flex-col bg-white border border-slate-300 rounded shadow-md
                md:-right-[110%] md:h-100 md:w-80
                lg:right-[50%] lg:h-110 lg:w-90
                3xl:w-100
                dark:bg-[#2B2B2F] dark:border-slate-700
          "
            >
              <div className="py-2.5 px-4 lg:py-3">
                <span className="text-[#464646] font-semibold text-sm lg:text-base 3xl:text-lg dark:text-white/90">
                  Notifications
                </span>

                {/* NÚT XÓA: Chỉ hiện khi có thông báo */}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifications}
                    title="Xóa tất cả"
                    className="
                      flex items-center gap-1 text-xs text-red-500 hover:text-red-700 
                      transition-colors cursor-pointer p-1 rounded hover:bg-red-50 dark:hover:bg-white/10
                    "
                  >
                    <FaTrash />
                    <span className="font-medium">Xóa tất cả</span>
                  </button>
                )}
              </div>
              <hr className="text-slate-300 h-1 w-full dark:text-slate-700" />
              <div className="h-full w-full flex flex-col overflow-y-scroll">
                {notifications.map((item, index) => (
                  <div
                    key={item._id}
                    className="
                        w-full flex flex-col 
                    "
                  >
                    <div className="relative flex flex-col gap-1 px-3 py-2 text-[12px] text-[#464646] md:text-[13px] lg:text-sm 3xl:text-[15px] dark:text-white/90">
                      <p className="font-semibold">
                        {generateNotificationTitle(item.type)}
                        {item.isRead ? "" : "🔹"}
                      </p>
                      <p className="text-[11px] px-2 md:text-[12px] lg:text-[13px] 3xl:text-sm">
                        {highlightPercent(item.message)}
                      </p>
                      <span className="text-[11px] text-slate-500 md:text-[12px] lg:text-[13px] 3xl:text-sm">
                        {formatDateToString(item.createdAt)}
                      </span>
                    </div>
                    {index !== notifications.length - 1 && (
                      <hr className="text-slate-300 h-0.5 w-full dark:text-slate-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <TfiMenuAlt
          onClick={() => setToggleSidebar(true)}
          className="
          text-2xl text-[#514D73] dark:text-white/90
          sm:text-[28px]
          md:text-[30px]
          lg:hidden
      "
        />
      </div>
      {toggleSidebar && (
        <SidebarComponent setToggleSidebar={setToggleSidebar} />
      )}
    </div>
  );
};

export default Header;
