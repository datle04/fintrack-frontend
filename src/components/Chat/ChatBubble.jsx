import React from "react";
import { Bot, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Lottie from "lottie-react";
import thinkingAnimation from "../../assets/coin wallet.json"; // Dùng lại animation loading

const ChatBubble = ({ message, isBot, isTyping }) => {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  // Thiết lập class cho tin nhắn BOT (trái)
  const botClasses = isDark
    ? "bg-[#3A3B3C] text-white rounded-br-xl" // Dark: Nền tối, chữ trắng
    : "bg-gray-200 text-gray-800 rounded-br-xl"; // Light: Nền xám nhạt, chữ đen

  // Thiết lập class cho tin nhắn USER (phải)
  const userClasses = "bg-indigo-500 text-white rounded-bl-xl";

  const messageClasses = isBot
    ? `self-start ${botClasses}`
    : `self-end ${userClasses}`;

  return (
    <div
      className={`flex w-full ${
        isBot ? "justify-start" : "justify-end"
      } mb-2 sm:mb-4`}
    >
      <div className="flex max-w-[85%] sm:max-w-[80%]">
        {/* Avatar/Icon của Bot */}
        {isBot && (
          <div className="mr-2 self-start p-1.5 sm:p-2 rounded-full bg-indigo-100 dark:bg-indigo-700">
            <Bot
              size={18}
              className="text-indigo-600 dark:text-white sm:size-5"
            />
          </div>
        )}

        {/* Nội dung tin nhắn */}
        <div
          className={`
            p-3 sm:p-4 shadow-md text-sm sm:text-base whitespace-pre-wrap transition-colors break-words
            rounded-tl-xl rounded-tr-xl ${messageClasses}
          `}
        >
          {isTyping ? (
            // Hiệu ứng Bot đang gõ (dùng Lottie animation)
            <Lottie
              animationData={thinkingAnimation}
              loop
              autoplay
              className="w-10 h-6"
            />
          ) : (
            message.reply || message.text
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
