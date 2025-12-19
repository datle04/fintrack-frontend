import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const HoverCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);

  const { contextSafe } = useGSAP({ scope: cardRef });

  const onEnter = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: -3,
      scale: 1.01,
      boxShadow:
        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      duration: 0.4,
      ease: "back.out(1.7)",
    });
  });

  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      boxShadow: "none",
      duration: 0.3,
      ease: "power2.out",
    });
  });

  return (
    <div
      ref={cardRef}
      className={`h-full w-full rounded-2xl ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};

export default HoverCard;
