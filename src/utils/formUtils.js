// src/utils/formUtils.ts

import dayjs from 'dayjs'; // Hoặc dùng new Date() nếu không cài dayjs

/**
 * So sánh và trả về các field thay đổi
 * @param initialValues Dữ liệu gốc từ API
 * @param formValues Dữ liệu hiện tại trên Form
 */
export const getDirtyValues = (initialValues, formValues) => {
  const changes = {};

  Object.keys(formValues).forEach((key) => {
    const original = initialValues[key];
    const current = formValues[key];

    // 1. Nếu field không tồn tại trong initial -> Bỏ qua hoặc lấy luôn (tùy logic)
    // Ở đây ta giả định formValues là tập con hoặc bằng initialValues

    // 2. Xử lý so sánh NGÀY THÁNG (Date)
    // Vì new Date('2023-01-01') !== new Date('2023-01-01') trong JS
    if (key === 'date' || key === 'targetDate' || key === 'dob') {
       const date1 = dayjs(original).format('YYYY-MM-DD');
       const date2 = dayjs(current).format('YYYY-MM-DD');
       if (date1 !== date2) {
         changes[key] = current;
       }
       return;
    }

    // 3. Xử lý so sánh MẢNG (Ví dụ: Categories, Images)
    // So sánh nông (JSON.stringify) là cách nhanh nhất cho dữ liệu nhỏ
    if (Array.isArray(original) || Array.isArray(current)) {
      if (JSON.stringify(original) !== JSON.stringify(current)) {
        changes[key] = current;
      }
      return;
    }

    // 4. So sánh giá trị cơ bản (String, Number, Boolean)
    // Dùng != thay vì !== để '100' (string) vẫn bằng 100 (number) nếu muốn
    // Nhưng tốt nhất nên dùng !== và đảm bảo type chuẩn
    if (original !== current) {
      // Logic riêng cho số: rỗng và 0 có thể coi là khác nhau
      changes[key] = current;
    }
  });

  return changes;
};