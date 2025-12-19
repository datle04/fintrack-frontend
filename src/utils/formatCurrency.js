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

  if (currencyCode === "VND") {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

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

  if (
    originalCurrency !== BASE_CURRENCY &&
    budget?.originalAmount &&
    budget?.totalBudget
  ) {
    if (budget.originalAmount !== 0) {
      exchangeRate = budget.totalBudget / budget.originalAmount;
    }
  }

  if (exchangeRate === 0) exchangeRate = 1;

  return {
    displayCurrency: originalCurrency,
    exchangeRate: exchangeRate, 
  };
};

export const getDisplaySpentValue = (budget) => {
  const { displayCurrency, exchangeRate } = getCurrencyInfo(budget);
  const totalSpent = budget?.totalSpent || 0; 

  const displaySpent = totalSpent / exchangeRate;

  return {
    displaySpent: displaySpent,
    displayCurrency: displayCurrency,
  };
};