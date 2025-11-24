// components/chatbot/ChatBubble.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import WidgetRenderer from "./WidgetRenderer";
import { gsap } from "gsap";

const ChatBubble = ({ message, isBot, isTyping }) => {
  const { reply, intent, data } = message;
  const replyRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  // Letter render component
  const Letter = ({ children }) => (
    <span className="gsap-letter">{children}</span>
  );

  useEffect(() => {
    // Chỉ chạy animation khi: Là Bot, không đang gõ (loading), chưa animate xong, và DOM đã có
    if (isBot && !isTyping && !animated && replyRef.current) {
      const allSpans = []; // Mảng chứa tất cả các chữ cái để animate

      // --- HÀM ĐỆ QUY: DUYỆT CÂY DOM ---
      // Giúp giữ nguyên cấu trúc thẻ (Bold, Italic...)
      const splitTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue;
          if (!text.trim() && text !== " ") return; // Bỏ qua node rỗng (trừ khoảng trắng đơn)

          const fragment = document.createDocumentFragment();

          // 1. SỬA LỖI ICON "?" & EMOJI:
          // Dùng Array.from (hoặc spread syntax) để tách Emoji đúng cách thay vì split('')
          // Hoặc tốt nhất là dùng Intl.Segmenter nếu trình duyệt hỗ trợ (để xử lý Emoji phức tạp)
          let chars;
          if (typeof Intl !== "undefined" && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter("vi", {
              granularity: "grapheme",
            });
            chars = Array.from(segmenter.segment(text)).map((s) => s.segment);
          } else {
            chars = Array.from(text); // Fallback
          }

          chars.forEach((char) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.opacity = "0"; // Ẩn ban đầu
            span.className = "gsap-letter"; // Class để style nếu cần

            // 2. SỬA LỖI KHOẢNG CÁCH:
            // Nếu là khoảng trắng, giữ nguyên width của nó
            if (char === " ") {
              span.style.whiteSpace = "pre";
            }

            fragment.appendChild(span);
            allSpans.push(span); // Thu thập vào mảng chung
          });

          node.replaceWith(fragment);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Nếu là thẻ (ví dụ <strong>), đi sâu vào bên trong nó
          // (Tránh widget renderer nếu nó nằm trong này - tuỳ cấu trúc)
          const children = Array.from(node.childNodes);
          children.forEach(splitTextNodes);
        }
      };

      // Bắt đầu duyệt từ root
      splitTextNodes(replyRef.current);

      // 3. ANIMATION GSAP
      if (allSpans.length > 0) {
        gsap.to(allSpans, {
          opacity: 1,
          duration: 0.01, // Rất nhanh cho mỗi chữ
          stagger: 0.02, // Độ trễ giữa các chữ tạo hiệu ứng gõ
          ease: "none",
          onComplete: () => {
            setAnimated(true);
            // Tùy chọn: Xóa các thẻ span để DOM sạch sẽ (nhưng sẽ gây repaint)
            // replyRef.current.innerHTML = reply;
          },
        });
      } else {
        setAnimated(true); // Fallback nếu không có text
      }
    }
  }, [reply, isBot, isTyping, animated]);

  return (
    <div className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <Bot size={18} className="text-indigo-600" />
        </div>
      )}

      <div className={`max-w-[85%] flex flex-col`}>
        {/* Bong bóng chat */}
        <div
          className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isBot
              ? "bg-white text-gray-800 border border-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-tl-none"
              : "bg-indigo-600 text-white rounded-tr-none"
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1 h-5 items-center">
              <span
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></span>
              <span
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></span>
            </div>
          ) : (
            <div
              ref={replyRef}
              className="prose prose-sm dark:prose-invert max-w-none"
            >
              {/* ReactMarkdown render HTML đầy đủ (bao gồm strong, em, a...)
                  Sau đó useEffect sẽ "mổ xẻ" HTML này để animate từng chữ bên trong 
                  mà KHÔNG làm mất thẻ bao ngoài.
              */}
              <ReactMarkdown>{reply}</ReactMarkdown>
            </div>
          )}
        </div>

        {isBot && !isTyping && data && (
          <div
            className={`transition-opacity duration-500 ${
              animated ? "opacity-100" : "opacity-0"
            }`}
          >
            <WidgetRenderer intent={intent} data={data} />
          </div>
        )}
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <User size={18} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
