import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { formatCurrency } from "../../utils/formatCurrency";

const CountUpNumber = ({
  value,
  currency,
  locale = "vi-VN",
  className = "",
}) => {
  const spanRef = useRef(null);

  useGSAP(() => {
    const tracker = { val: 0 };

    gsap.to(tracker, {
      val: value,
      duration: 1.5,
      ease: "power2.out",

      onUpdate: () => {
        if (spanRef.current) {
          spanRef.current.innerText = formatCurrency(
            tracker.val,
            currency,
            locale
          );
        }
      },
    });
  }, [value, currency, locale]);

  return (
    <span ref={spanRef} className={className}>
      0
    </span>
  );
};

export default CountUpNumber;
