import { useMemo } from "react";
import { getDisplaySpentValue } from "../utils/formatCurrency";

export const useBudgetCalculations = (budget) => {
  return useMemo(() => {
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

    const { originalAmount, totalBudget, categoryStats } = budget;
    
    const processed = getDisplaySpentValue(budget);
    const currency = processed.displayCurrency;

    const budgetAmount = currency === "VND" ? totalBudget : originalAmount;
    
    const spentAmount = processed.displaySpent;

    const remaining = budgetAmount - spentAmount;

    const calculatedCategories = (categoryStats || []).map(cat => {
      let catBudget = 0;
      let catSpent = 0;

      if (currency === "VND") {
        catBudget = cat.budgetedAmount;
        catSpent = cat.spentAmount;
      } else {
        catBudget = cat.originalBudgetedAmount;
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
      categoryStats: calculatedCategories 
    };
  }, [budget]);
};