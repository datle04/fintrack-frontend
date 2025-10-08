import React from "react";
import formatCurrency from "../../utils/formatCurrency";

const SummaryCards = ({
  totalIncome,
  totalExpense,
  transactionCount,
  userCount,
}) => {
  const cardStyle = "flex-1 p-4 shadow-md rounded-xl border-slate-300 bg-white";
  const titleStyle = "text-gray-500 text-sm font-semibold";
  const valueStyle =
    "text-base font-semibold text-gray-800 mt-1 lg:text-xl 3xl:text-2xl";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 font-mono">
      <div className={cardStyle}>
        <div className={titleStyle}>💹 Tổng thu nhập</div>
        <div className={valueStyle}>{formatCurrency(totalIncome)} đ</div>
      </div>
      <div className={cardStyle}>
        <div className={titleStyle}>💸 Tổng chi tiêu</div>
        <div className={valueStyle}>{formatCurrency(totalExpense)} đ</div>
      </div>
      <div className={cardStyle}>
        <div className={titleStyle}>👥 Người dùng</div>
        <div className={valueStyle}>{userCount}</div>
      </div>
      <div className={cardStyle}>
        <div className={titleStyle}>📊 Tổng giao dịch</div>
        <div className={valueStyle}>{transactionCount}</div>
      </div>
    </div>
  );
};

export default SummaryCards;
