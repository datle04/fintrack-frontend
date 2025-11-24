import React, { useState, useEffect, useRef, useMemo } from "react";
import { Send, Bot, X } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ChatBubble from "./ChatBubble";
import axiosInstance from "../../api/axiosInstance";

const CHATBOT_API_URL =
  import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:4001";

const ChatWidget = ({ isOpen, onClose, onClick }) => {
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.token);
  const scrollRef = useRef(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "model",
      reply:
        "Chào bạn! Mình là FinAI 🤖. Mình có thể giúp bạn tra cứu chi tiêu, xem xu hướng hoặc thêm giao dịch mới.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus vào input khi mở chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Hàm xử lý gửi tin nhắn (Tách riêng để tái sử dụng)
  const handleSendMessage = async (text) => {
    if (!text || !text.trim() || loading) return;

    const currentInput = text.trim();

    // 1. Thêm tin nhắn User ngay lập tức
    const userMessage = { role: "user", reply: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 2. Gọi API
      const res = await axiosInstance.post(`${CHATBOT_API_URL}/chat`, {
        message: currentInput,
      });

      console.log(res.data);

      // 3. Nhận kết quả từ Backend (bao gồm reply, intent, data)
      const botResponse = res.data.result;

      // 4. Thêm tin nhắn Bot
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          reply: botResponse.reply,
          intent: res.data.intent, // Lưu intent để render widget
          data: botResponse.data, // Lưu data để render widget
        },
      ]);
    } catch (error) {
      console.error("❌ Lỗi gọi Chatbot API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          reply:
            "Xin lỗi, kết nối đến FinAI đang gặp sự cố. Bạn thử lại sau nhé! 😔",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Wrapper cho form submit
  const onFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Các gợi ý nhanh
  const quickReplies = useMemo(
    () => [
      "Tổng chi tháng này",
      "Tổng chi tiêu cho ăn uống",
      "Xu hướng chi tiêu năm nay",
      "Thêm 50k ăn sáng",
    ],
    [t]
  );

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed bottom-0 right-0 z-100 w-full h-full sm:h-[600px] sm:max-h-[85vh] sm:w-[380px] lg:w-[480px] sm:bottom-2 sm:right-2 
        bg-white rounded-t-xl sm:rounded-l shadow-2xl flex flex-col 
        animate-fadeIn
        dark:bg-[#2E2E33] dark:border dark:border-slate-700
      `}
    >
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-indigo-500 rounded-t-xl text-white flex items-center justify-between dark:bg-indigo-700">
        <div className="flex items-center gap-2">
          <Bot size={20} className="sm:size-6" />
          <h3 className="font-semibold text-lg sm:text-xl">
            {t("suggestion")} FinAI
          </h3>
        </div>
        {/* Nút đóng cho Mobile & Desktop */}
        {/* Dùng onClick={onClose} để gọi hàm setIsChatOpen(false) từ App.jsx */}
        <button
          onClick={onClick}
          className="p-1 text-white hover:text-red-200 cursor-pointer"
        >
          <X size={24} className="sm:size-6" />
        </button>
      </div>

      {/* Message Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 sm:space-y-4"
      >
        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            message={msg}
            isBot={msg.role === "model"}
            isTyping={false}
          />
        ))}
        {loading && (
          <ChatBubble
            message={{ reply: "Đang nghĩ...", role: "model" }}
            isBot={true}
            isTyping={true}
          />
        )}
      </div>

      {/* Quick Replies */}
      <div className="flex flex-wrap gap-2 p-3 border border-t-slate-300 border-b-slate-300 border-r-0 border-l-0 dark:border-slate-700">
        {quickReplies.map((reply, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(reply)}
            className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white"
            disabled={loading}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={onFormSubmit} className="flex p-3  dark:border-slate-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi FinAI..."
          className="flex-1 p-3 text-sm border border-slate-300 rounded-l-lg focus:outline-none dark:bg-[#2E2E33] dark:border-slate-600 dark:text-white"
          disabled={loading}
        />
        <button
          type="submit"
          className="p-2 px-3 bg-indigo-500 text-white rounded-r-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 dark:bg-indigo-700 cursor-pointer"
          disabled={loading || !input.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
