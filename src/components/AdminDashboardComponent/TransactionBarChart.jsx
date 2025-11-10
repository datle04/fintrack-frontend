import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TransactionBarChart = ({ transactionData }) => {
  const data = {
    labels: [
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
    ],
    datasets: [
      {
        label: "Transactions",
        data: transactionData,
        backgroundColor: "rgba(59,130,246,0.8)",
        borderRadius: 6,
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
        Tổng giao dịch hàng tháng
      </h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TransactionBarChart;
