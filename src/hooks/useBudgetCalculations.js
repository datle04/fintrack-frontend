import { useMemo } from "react";
import { getDisplaySpentValue } from "../utils/formatCurrency";

export const useBudgetCalculations = (budget) => {
  return useMemo(() => {
    // 1. Xử lý trường hợp chưa có budget
    if (!budget || !budget.month) {
      return {
        displayBudget: 0,
        displaySpent: 0,
        displayRemaining: 0,
        displayCurrency: "VND",
        percentUsed: 0,
        isOverBudget: false,
        categoryStats: []
      };
    }

    // 2. Lấy thông tin cơ bản
    const { originalAmount, totalBudget, categoryStats } = budget;
    
    // 3. Sử dụng helper có sẵn để xác định tiền tệ hiển thị (VND hay Ngoại tệ)
    const processed = getDisplaySpentValue(budget);
    const currency = processed.displayCurrency; // Ví dụ: "USD"
    
    // 4. Tính tổng ngân sách hiển thị
    // Nếu là VND -> dùng totalBudget (đã quy đổi trong DB)
    // Nếu là Ngoại tệ -> dùng originalAmount (số gốc user nhập)
    const budgetAmount = currency === "VND" ? totalBudget : originalAmount;
    
    // 5. Số đã chi (đã được helper xử lý quy đổi nếu cần)
    const spentAmount = processed.displaySpent;

    // 6. Số còn lại
    const remaining = budgetAmount - spentAmount;

    // 7. Tính lại danh sách Categories (để component con không phải tính nữa)
    const calculatedCategories = (categoryStats || []).map(cat => {
      let catBudget = 0;
      let catSpent = 0;

      if (currency === "VND") {
        catBudget = cat.budgetedAmount;
        catSpent = cat.spentAmount;
      } else {
        catBudget = cat.originalBudgetedAmount;
        // Tính tỷ giá ngược lại cho từng category nếu cần, 
        // hoặc đơn giản là lấy spentAmount / tỷ giá chung (nếu có)
        // Ở đây giả định logic đơn giản nhất dựa trên % đã dùng để suy ra số tiền ngoại tệ
        // Spent (Foreign) = Budget (Foreign) * (Percent / 100)
        catSpent = (cat.originalBudgetedAmount * cat.percentUsed) / 100;
      }

      return {
        ...cat,
        displayBudget: catBudget,
        displaySpent: catSpent,
        displayRemaining: catBudget - catSpent,
        isOver: cat.percentUsed > 100
      };
    });

    return {
      displayBudget: budgetAmount,
      displaySpent: spentAmount,
      displayRemaining: remaining,
      displayCurrency: currency,
      percentUsed: budget.totalPercentUsed,
      isOverBudget: spentAmount > budgetAmount,
      categoryStats: calculatedCategories // Dữ liệu đã "sạch" để render
    };
  }, [budget]);
};