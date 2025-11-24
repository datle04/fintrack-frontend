// components/common/GsapHoverCard.jsx
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const HoverCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);

  // Sử dụng contextSafe để dọn dẹp animation khi unmount
  const { contextSafe } = useGSAP({ scope: cardRef });

  const onEnter = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: -3, // Nhấc lên 8px
      scale: 1.01, // Phóng to cực nhẹ
      boxShadow:
        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", // Bóng đậm
      duration: 0.4,
      ease: "back.out(1.7)", // ✨ Hiệu ứng nảy nhẹ khi hover vào
    });
  });

  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      boxShadow: "none", // Hoặc bóng mặc định ban đầu
      duration: 0.3,
      ease: "power2.out", // Hạ xuống êm ái
    });
  });

  return (
    <div
      ref={cardRef}
      className={`h-full w-full rounded-2xl ${className}`} // Class grid sẽ vào đây
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};

export default HoverCard;
