import { io, Socket } from "socket.io-client";

let socket = null;
const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

export const connectSocket = (userId) => {
  if (!userId) {
    console.error("❌ [Socket] Connect failed: No User ID provided.");
    return null;
  }

  if (socket) {
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
        console.log("⚠️ [Socket] User changed. Disconnecting old socket...");
        socket.disconnect();
        socket = null; 
    }
  }

console.log(`🔌 [Socket] Creating NEW connection for User: ${userId}`);

socket = io(BACK_END_URL, {
  transports: ["websocket"], 
  upgrade: false,
  withCredentials: true,
  auth: {
    userId: userId 
  }, 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

  socket.on("connect", () => {
    console.log("✅ [Socket] Connected. ID:", socket?.id);
    socket?.emit("session.start", { userId });
  });

  socket.on("disconnect", (reason, details) => {
    console.error(`❌ Disconnected. Reason: ${reason}`);
    if (reason === "io server disconnect") {
      console.warn("👉 Server chủ động ngắt kết nối. Kiểm tra Auth/CORS trên server.");
    }
    if (details) console.log("Details:", details);
  });

  socket.on("connect_error", (err) => {
    console.error("🔥 Connection Error:", err.message); 
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