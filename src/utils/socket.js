// src/utils/socket.ts
import { io } from "socket.io-client";

let socket = null;
const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

// Sửa: Nhận userId để gửi lên Backend (quan trọng để Join Room)
export const connectSocket = (userId) => {
  console.log("🔌 [FRONTEND] Connecting with UserID:", userId); 

  if (!userId) {
    console.error("❌ [FRONTEND] NO USER ID PROVIDED! Socket will not join room.");
  }
  // Nếu socket đã tồn tại và đang kết nối, không cần tạo lại
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(BACK_END_URL, {
    transports: ["websocket"],
    withCredentials: true, // Gửi Cookie (HttpOnly)
    query: { userId: userId }, // 👈 GỬI USERID ĐỂ BACKEND JOIN ROOM
  });

  socket.on("connect", () => {
    console.log("🔌 Connected to socket server:", socket.id);
    socket?.emit("session.start", { userId });
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket Connection Error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket server");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};