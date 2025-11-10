import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const IncomeExpenseChart = ({ monthlyStats }) => {
  const incomeData = monthlyStats.map((item) => item.income);
  const expenseData = monthlyStats.map((item) => item.expense);
  const labels = [
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "T8",
    "T9",
    "T10",
    "T11",
    "T12",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        fill: true,
        backgroundColor: "rgba(34,197,94,0.2)",
        borderColor: "rgba(34,197,94,1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "rgba(34,197,94,1)",
      },
      {
        label: "Expense",
        data: expenseData,
        fill: true,
        backgroundColor: "rgba(239,68,68,0.2)",
        borderColor: "rgba(239,68,68,1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "rgba(239,68,68,1)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="bg-white p-4 border border-slate-300 shadow-md rounded-xl">
      <h2 className="my-2 text-base text-center lg:text-lg 3xl:text-xl font-semibold text-gray-800">
        Tổng thu chi hàng tháng
      </h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default IncomeExpenseChart;
