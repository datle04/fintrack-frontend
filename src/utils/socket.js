// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket = null;
const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

export const connectSocket = (userId) => {
  // 0. Kiểm tra UserID (Quan trọng nhất)
  if (!userId) {
    console.error("❌ [Socket] Connect failed: No User ID provided.");
    return null;
  }

  // 1. Nếu socket đã tồn tại
  if (socket) {
    // Kiểm tra xem socket này có phải của userId hiện tại không?
    // (Tránh trường hợp logout user A, login user B mà vẫn dùng socket của A)
    // @ts-ignore (query đôi khi không accessible trực tiếp tuỳ version, nhưng logic là cần check)
    const currentQueryId = socket.io?.opts?.query?.userId;

    if (currentQueryId === userId) {
        if (socket.connected) {
            console.log("♻️ [Socket] Reusing existing connection:", socket.id);
            return socket;
        } else {
            console.log("🔄 [Socket] Reconnecting existing socket...");
            socket.connect();
            return socket;
        }
    } else {
        // Nếu userId khác (đổi user), phải disconnect cái cũ và tạo cái mới
        console.log("⚠️ [Socket] User changed. Disconnecting old socket...");
        socket.disconnect();
        socket = null; 
    }
  }

  // 2. Tạo kết nối mới
console.log(`🔌 [Socket] Creating NEW connection for User: ${userId}`);

socket = io(BACK_END_URL, {
  // ⚠️ QUAN TRỌNG: Chỉ dùng websocket để tránh lỗi 400/Session unknown trên Render
  transports: ["websocket"], 
  
  // ⚠️ QUAN TRỌNG: Tắt upgrade để không bao giờ fallback về polling
  upgrade: false,

  withCredentials: true,
  
  // 👉 ĐỔI MỚI: Dùng auth thay vì query (An toàn và chuẩn hơn)
  auth: {
    userId: userId 
  },
  
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

  // 3. Setup Listeners cơ bản (Chỉ setup 1 lần khi tạo mới)
  socket.on("connect", () => {
    console.log("✅ [Socket] Connected. ID:", socket?.id);
    socket?.emit("session.start", { userId });
  });

  socket.on("disconnect", (reason, details) => {
    console.error(`❌ Disconnected. Reason: ${reason}`);
    // Nếu server đá, reason sẽ là "io server disconnect"
    if (reason === "io server disconnect") {
      // Server đá thì client sẽ không tự connect lại, phải gọi thủ công nếu muốn
      // socket.connect(); 
      console.warn("👉 Server chủ động ngắt kết nối. Kiểm tra Auth/CORS trên server.");
    }
    if (details) console.log("Details:", details);
  });

  socket.on("connect_error", (err) => {
    console.error("🔥 Connection Error:", err.message); 
    // Nếu lỗi là "xhr poll error" hoặc "websocket error", thường là do CORS
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("🛑 [Socket] Manually disconnecting...");
    socket.disconnect();
    socket = null;
  }
};