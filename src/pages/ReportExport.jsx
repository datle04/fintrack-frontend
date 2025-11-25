import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactDOMServer from "react-dom/server";
import { useDispatch, useSelector } from "react-redux";

import ReportTemplate from "../components/ReportTemplate";
import DailyExpenseChart from "../components/Chart/DailyExpenseChart";
import PieChartDuplicate from "../components/Chart/PieChartDuplicate";

import { getTransactionsByMonth } from "../features/transactionSlice";
import { getDashboard } from "../features/dashboardSlice";
import { getBudget } from "../features/budgetSlice";
import { getExpenseStat } from "../features/statSlice";
import ThemeToggle from "../components/ThemeToggle";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const ReportExport = ({ month, year }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const {
    totalIncome,
    totalExpense,
    currency: dashboardCurrency,
  } = useSelector((state) => state.dashboard);
  const { originalAmount, currency: budgetCurrency } = useSelector(
    (state) => state.budget
  );
  const transactions = useSelector((state) => state.transaction.transactions);
  const { stats, currency: statsCurrency } = useSelector((state) => state.stat);
  const { loading: statsLoading } = useSelector((state) => state.stat);

  const [barChartUrl, setBarChartUrl] = useState("");
  const [pieChartUrl, setPieChartUrl] = useState("");
  const [chartsReady, setChartsReady] = useState(false);
  const now = new Date();

  useEffect(() => {
    if (pieChartUrl) {
      // Case 1: Chart render thành công
      setChartsReady(true);
    } else if (!statsLoading && stats && stats.length === 0) {
      // Case 2: Đã tải xong và không có dữ liệu
      // Vẫn là "sẵn sàng" để export (với chart rỗng)
      setChartsReady(true);
    }
  }, [pieChartUrl, stats, statsLoading]);

  useEffect(() => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    dispatch(getBudget({ month, year }));
    dispatch(
      getDashboard({
        start: startOfMonth,
        end: endOfMonth,
        currency: user.currency,
      })
    );
    dispatch(getTransactionsByMonth({ month, year }));
    dispatch(
      getExpenseStat({
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: endOfMonth.toISOString().split("T")[0],
        currency: user.currency,
      })
    );
  }, [dispatch, month, year, user.currency]);

  useEffect(() => {
    console.log(stats);
  }, [stats]);

  const dailyExpense = transactions.reduce((acc, tx) => {
    if (tx.type !== "expense") return acc;
    const day = new Date(tx.date).getDate();
    // Luôn nhân với tỷ giá
    const baseAmount = tx.amount * (tx.exchangeRate || 1);
    acc[day] = (acc[day] || 0) + baseAmount;
    return acc;
  }, {});

  const dailyExpenseData = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    expense: dailyExpense[i + 1] || 0,
  }));

  const handleExport = () => {
    // 1. CHUẨN BỊ DỮ LIỆU (Đồng bộ)
    // Các tác vụ này nhanh, không cần đưa vào "pending"
    const data = {
      user: {
        name: user.name,
        address: user.address,
        phone: user.phone,
        dob: user.dob,
      },
      summary: {
        income: totalIncome,
        expense: totalExpense,
        budgetCurrency,
        statsCurrency,
        dashboardCurrency,
        diff: parseFloat(totalIncome) - parseFloat(totalExpense),
        budget: originalAmount,
      },
      transactions,
      pieChartUrl,
      heatmapUrl: barChartUrl,
    };

    const htmlString = ReactDOMServer.renderToStaticMarkup(
      <ReportTemplate month={month} year={year} data={data} />
    );

    // 2. ĐỊNH NGHĨA PROMISE SẼ CHẠY
    // Đây là hàm sẽ thực thi khi toast.promise được gọi
    const exportPromise = async () => {
      const res = await axiosInstance.post(`/api/report/export`, {
        html: htmlString,
        reportId: data.reportId,
        month: `${month}-${year}`,
      });

      // Trả về dữ liệu khi thành công (fileUrl)
      // Dữ liệu này sẽ được chuyển vào hàm 'render' của 'success'
      return `${BACK_END_URL}/${res.data.report.filePath}`;
    };

    // 3. GỌI TOAST.PROMISE
    // Tự động xử lý UI cho 3 trạng thái
    toast.promise(
      exportPromise(), // Thực thi promise
      {
        // 'pending' đổi thành 'loading'
        loading: "Đang xuất báo cáo, vui lòng chờ... ⏳",

        success: (fileUrl) => {
          // fileUrl chính là 'data' được trả về
          window.open(fileUrl);
          return "Đã xuất báo cáo thành công! 🎉";
        }, // 'error' là một HÀM, không phải object

        error: (err) => {
          // err chính là 'data' (lỗi) bị catch
          console.error("❌ Xuất báo cáo thất bại:", err);
          return err.response?.data?.message || "Xuất báo cáo thất bại!";
        },
      }
    );
  };

  return (
    <div className="space-y-4 mt-5 w-full flex flex-col ">
      <div className="absolute hidden w-full h-[600px] -z-10 opacity-0 pointer-events-none">
           {" "}
        {stats &&
          stats.length > 0 && ( // <-- THÊM ĐIỀU KIỆN NÀY
            <PieChartDuplicate
              stats={stats}
              onRender={(url) => {
                if (!pieChartUrl) setPieChartUrl(url);
              }}
            />
          )}
         {" "}
      </div>

      <button
        onClick={handleExport}
        disabled={!chartsReady}
        className="self-end py-1 bg-transparent text-sky-600 cursor-pointer hover:underline"
      >
        Xuất báo cáo tháng {month}/{year}📄
      </button>
    </div>
  );
};

export default ReportExport;
