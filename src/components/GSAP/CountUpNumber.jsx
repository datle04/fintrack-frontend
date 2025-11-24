// src/components/common/CountUpNumber.jsx
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
// Import hàm format của bạn để số chạy vẫn đúng định dạng tiền tệ
import { formatCurrency } from "../../utils/formatCurrency";

const CountUpNumber = ({
  value,
  currency,
  locale = "vi-VN",
  className = "",
}) => {
  const spanRef = useRef(null);

  useGSAP(() => {
    // 1. Tạo một object trung gian để GSAP animate giá trị của nó
    const tracker = { val: 0 };

    // 2. Thực hiện animation
    gsap.to(tracker, {
      val: value, // Đích đến
      duration: 1.5, // Thời gian chạy (1.5 giây)
      ease: "power2.out", // Hiệu ứng chậm dần về cuối cho mượt

      // 3. Hàm này chạy liên tục mỗi khi giá trị 'val' thay đổi
      onUpdate: () => {
        if (spanRef.current) {
          // Format giá trị hiện tại và gán vào DOM
          // Math.ceil để tránh số lẻ nhấp nháy quá nhiều
          spanRef.current.innerText = formatCurrency(
            tracker.val,
            currency,
            locale
          );
        }
      },
    });
  }, [value, currency, locale]); // Chạy lại nếu giá trị thay đổi

  return (
    <span ref={spanRef} className={className}>
      {/* Giá trị khởi điểm */}0
    </span>
  );
};

export default CountUpNumber;
