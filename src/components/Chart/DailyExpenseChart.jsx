import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const DailyExpenseChart = ({ data, onRender }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const hasRenderedImage = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
      hasRenderedImage.current = false;
    }

    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.day.toString()),
        datasets: [
          {
            label: "Chi tiêu (VNĐ)",
            data: data.map((item) => item.expense),
            backgroundColor: "#f87171",
          },
        ],
      },
      options: {
        animation: {
          onComplete: () => {
            if (!hasRenderedImage.current && canvasRef.current) {
              const imageUrl = canvasRef.current.toDataURL("image/png");
              onRender?.(imageUrl);
              hasRenderedImage.current = true;
            }
          },
        },
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });

    chartRef.current = newChart;

    return () => {
      newChart.destroy();
    };
  }, [data]);

  return <canvas ref={canvasRef} className="w-full h-64" />;
};

export default DailyExpenseChart;
