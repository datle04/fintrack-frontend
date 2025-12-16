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

    // Xử lý riêng cho trường hợp Số vs Chuỗi số (VD: amount, targetOriginalAmount)
    // Nếu cả 2 đều quy đổi được ra số và bằng nhau -> Coi như không đổi
    if (
        typeof original === 'number' && 
        typeof current === 'string' && 
        !isNaN(Number(current))
    ) {
        if (original === Number(current)) return; // Bỏ qua, coi như giống nhau
    }

    // So sánh giá trị cơ bản
    if (original !== current) {
      // Logic chặn chuỗi rỗng và null (tùy chọn)
      // Nếu dữ liệu cũ là null/undefined và mới là "" -> Coi như giống nhau
      if ((original === null || original === undefined) && current === "") return;
      
      changes[key] = current;
    }
  });

  return changes;
};