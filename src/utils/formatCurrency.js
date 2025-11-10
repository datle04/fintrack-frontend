/**
 * Định dạng tiền tệ chuyên nghiệp, tự động xử lý vị trí ký hiệu
 * dựa trên ngôn ngữ (locale) và loại tiền tệ.
 *
 * @param {number} amount - Số tiền
 * @param {string} currencyCode - Mã tiền tệ (ví dụ: "VND", "USD")
 * @param {string} locale - Mã ngôn ngữ (ví dụ: "vi", "en")
 * @returns {string} - Chuỗi đã định dạng (ví dụ: "10.000 ₫" hoặc "$10.50")
 */
export const formatCurrency = (amount, currencyCode = "VND", locale = "vi") => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }

  const options = {
    style: "currency",
    currency: currencyCode,
  };

  // Quy tắc đặc biệt: Không hiển thị số lẻ cho VND
  if (currencyCode === "VND") {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  // Tự động định dạng dựa trên ngôn ngữ
  // 'vi' sẽ ra: 10.000 ₫
  // 'en' sẽ ra: $10.00
  return new Intl.NumberFormat(locale, options).format(amount);
};


/**
 * Lấy thông tin tiền tệ và tỷ giá quy đổi từ budget object.
 * Tỷ giá này là tỷ giá để đổi TỪ Base (VND) SANG Display (EUR).
 * @param {object} budget - Toàn bộ budget object.
 * @returns {object} - { displayCurrency, exchangeRate }
 */
const BASE_CURRENCY = "VND";

export const getCurrencyInfo = (budget) => {
  const originalCurrency = budget?.currency || BASE_CURRENCY;
  let exchangeRate = 1; // Mặc định 1:1 (nếu là VND)

  // Chỉ tính tỷ giá nếu tiền tệ khác VND
  if (
    originalCurrency !== BASE_CURRENCY &&
    budget?.originalAmount &&
    budget?.totalBudget
  ) {
    // Tỷ giá = (Tổng VND) / (Tổng Gốc EUR)
    if (budget.originalAmount !== 0) {
      exchangeRate = budget.totalBudget / budget.originalAmount;
    }
  }

  // Safeguard: Tránh lỗi chia cho 0
  if (exchangeRate === 0) exchangeRate = 1;

  return {
    displayCurrency: originalCurrency,
    exchangeRate: exchangeRate, // Tỷ giá (VND -> Display Currency)
  };
};

/**
 * Hàm cũ của bạn, giờ đã được refactor để dùng getCurrencyInfo
 */
export const getDisplaySpentValue = (budget) => {
  const { displayCurrency, exchangeRate } = getCurrencyInfo(budget);
  const totalSpent = budget?.totalSpent || 0; 

  const displaySpent = totalSpent / exchangeRate;

  return {
    displaySpent: displaySpent,
    displayCurrency: displayCurrency,
  };
};