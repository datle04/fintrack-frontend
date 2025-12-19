import React from "react";
import { MessageCircle, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ChatIcon = ({ isOpen, onClick }) => {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-4 right-4 z-50 p-3 sm:p-4 
        rounded-full shadow-2xl transition-all duration-300 transform 
        hover:scale-110 
        ${
          isOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-indigo-500 hover:bg-indigo-600"
        }
        text-white
      `}
      title={isOpen ? "Đóng FinAI" : "Mở FinAI"}
    >
      {isOpen ? (
        <X size={24} className="sm:size-6" />
      ) : (
        <MessageCircle size={24} className="sm:size-6" />
      )}
    </button>
  );
};

export default ChatIcon;
