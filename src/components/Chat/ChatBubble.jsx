import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import WidgetRenderer from "./WidgetRenderer";
import { gsap } from "gsap";

const ChatBubble = ({ message, isBot, isTyping, shouldAnimate = true }) => {
  const { reply, intent, data } = message;
  const replyRef = useRef(null);

  const [animated, setAnimated] = useState(!shouldAnimate);

  useEffect(() => {
    if (!isBot || isTyping || animated || !shouldAnimate || !replyRef.current) {
      return;
    }

    const allSpans = [];

    const splitTextNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (!text.trim() && text !== " ") return;

        const fragment = document.createDocumentFragment();

        let chars;
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
          const segmenter = new Intl.Segmenter("vi", {
            granularity: "grapheme",
          });
          chars = Array.from(segmenter.segment(text)).map((s) => s.segment);
        } else {
          chars = Array.from(text);
        }

        chars.forEach((char) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.opacity = "0";
          span.className = "gsap-letter";

          if (char === " ") {
            span.style.whiteSpace = "pre";
          }

          fragment.appendChild(span);
          allSpans.push(span);
        });

        node.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from(node.childNodes);
        children.forEach(splitTextNodes);
      }
    };

    splitTextNodes(replyRef.current);

    if (allSpans.length > 0) {
      gsap.to(allSpans, {
        opacity: 1,
        duration: 0.01,
        stagger: 0.02,
        ease: "none",
        onComplete: () => {
          setAnimated(true);
        },
      });
    } else {
      setAnimated(true);
    }
  }, [reply, isBot, isTyping, animated, shouldAnimate]);

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
              <ReactMarkdown>{reply}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Widget: Chỉ hiện khi (isBot && không gõ && có data). 
            Hiệu ứng Fade dựa vào state animated */}
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
