import React, { useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartDuplicate = ({ stats, onRender }) => {
  const chartRef = useRef(null);

  const COLORS = [
    "#5D43DB",
    "#D1CDFB",
    "#4ade80",
    "#60a5fa",
    "#facc15",
    "#f87171",
    "#fbbf24",
    "#34d399",
  ];

  const totalAmount = stats.reduce((acc, item) => acc + item.displayAmount, 0);

  const data = {
    labels: stats.map((stat) => stat.category),
    datasets: [
      {
        label: "Stats",
        data: stats.map((stat) => stat.displayAmount),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: false,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 20,
          padding: 20,
          font: {
            size: 14,
          },
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];
            return chart.data.labels.map((label, i) => {
              const value = dataset.data[i];
              const percent = totalAmount
                ? ((value / totalAmount) * 100).toFixed(1)
                : 0;

              return {
                text: `${label}: ${Number(
                  value
                ).toLocaleString()} đ (${percent}%)`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: dataset.backgroundColor[i],
                lineWidth: 1,
                hidden: isNaN(value) || value === 0,
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const value = context.raw || 0;
            const percent = totalAmount
              ? ((value / totalAmount) * 100).toFixed(1)
              : 0;
            return `${
              context.label
            }: ${value.toLocaleString()} đ (${percent}%)`;
          },
        },
      },
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (chartRef.current?.canvas) {
        const base64 = chartRef.current.canvas.toDataURL("image/png");
        onRender(base64);
      }
    }, 500); // delay nhẹ để đảm bảo chart đã render

    return () => clearTimeout(timer);
  }, [stats]);

  return (
    <div className="w-[600px] h-[400px] absolute -top-[9999px] -left-[9999px]">
      <Pie
        ref={chartRef}
        data={data}
        options={options}
        width={600}
        height={400}
      />
    </div>
  );
};

export default PieChartDuplicate;
