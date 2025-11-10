// src/utils/socket.ts
import { io } from "socket.io-client";

let socket = null;
const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

export const connectSocket = (token) => {
  socket = io(BACK_END_URL, {
    transports: ["websocket"],
    withCredentials: true, // 👈 GỬI COOKIE cùng socket handshake
  });

  socket.on("connect", () => {
    console.log("🔌 Connected to socket server");
    socket?.emit("session.start");
    
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket server");
  });

  socket.io.on("ping", () => {
  console.log("📤 Ping sent to server");
});
socket.io.on("pong", () => {
  console.log("📥 Pong received from server");
});

  return socket;
};

export const getSocket = () => socket;
