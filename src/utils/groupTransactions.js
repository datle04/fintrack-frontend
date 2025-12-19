export const groupTransactionsByDate = (transactions) => {
  const groups = transactions.reduce((acc, transaction) => {
    const dateKey = transaction.date.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {});

  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((date) => ({
      date,
      items: groups[date],
    }));
};