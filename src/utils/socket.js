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

  // 2. Tạo kết nối mới (Nếu chưa có hoặc đã reset)
  console.log(`🔌 [Socket] Creating NEW connection for User: ${userId}`);
  
  socket = io(BACK_END_URL, {
    transports: ["websocket"],
    withCredentials: true,
    query: { userId: userId }, // Gửi userId để Join Room
    
    // Thêm options để ổn định kết nối
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // 3. Setup Listeners cơ bản (Chỉ setup 1 lần khi tạo mới)
  socket.on("connect", () => {
    console.log("✅ [Socket] Connected. ID:", socket?.id);
    socket?.emit("session.start", { userId });
  });

  socket.on("connect_error", (err) => {
    console.error("❌ [Socket] Connection Error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ [Socket] Disconnected. Reason:", reason);
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