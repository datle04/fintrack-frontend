// utils/groupTransactions.js
export const groupTransactionsByDate = (transactions) => {
  const groups = transactions.reduce((acc, transaction) => {
    // Lấy phần ngày YYYY-MM-DD
    const dateKey = transaction.date.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {});

  // Sắp xếp các nhóm theo ngày giảm dần (mới nhất lên đầu)
  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((date) => ({
      date,
      items: groups[date],
    }));
};