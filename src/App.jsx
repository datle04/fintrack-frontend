import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import Header from "./components/Header";
import BudgetPage from "./pages/BudgetPage";
import TransactionPage from "./pages/TransactionPage";
import StatPage from "./pages/StatPage";
import SettingPage from "./pages/SettingPage";
import MainLayout from "./layout/MainLayout";
import BigSideBar from "./components/BigSideBar";
import { useLoading } from "./context/LoadingContext";
import FullScreenLottie from "./components/Loading/FullScreenLottie";
import ReportExport from "./pages/ReportExport";
import { connectSocket, getSocket } from "./utils/socket";
import { useEffect } from "react";
import ReportTemplate from "./components/ReportTemplate";
import { ThemeProvider } from "./context/ThemeContext";
import AdminRoute from "./routes/AdminRoute";
import { useSelector } from "react-redux";
import AdminUser from "./pages/admin/AdminUser";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTransaction from "./pages/admin/AdminTransaction";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLog from "./pages/admin/AdminLog";

function App() {
  const { isAppLoading } = useLoading();
  const user = useSelector((state) => state.auth.user);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   const socket = connectSocket(token);

  //   // Gửi session update mỗi 30s
  //   const interval = setInterval(() => {
  //     socket.emit("session.update");
  //   }, 30_000);

  //   const handleBeforeUnload = () => {
  //     socket.emit("session.end");
  //     socket.disconnect();
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     clearInterval(interval);
  //     socket.disconnect();
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <>
      {isAppLoading && <FullScreenLottie />}
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <MainLayout header={<Header />} sidebar={<BigSideBar />} />
            }
          >
            {/* Route người dùng thường */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/stat" element={<StatPage />} />
            <Route path="/settings" element={<SettingPage />} />

            {/* Route admin - dùng chung layout nhưng kiểm tra role bằng AdminRoute */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUser />} />
              <Route path="transactions" element={<AdminTransaction />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="logs" element={<AdminLog />} />
            </Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
