import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import Header from "./components/Header";
import BudgetPage from "./pages/BudgetPage";
import TransactionPage from "./pages/TransactionPage";
import StatPage from "./pages/StatPage";
import SettingPage from "./pages/SettingPage";
import GoalPage from "./pages/GoalPage";
import MainLayout from "./layout/MainLayout";
import BigSideBar from "./components/BigSideBar";
import { useLoading } from "./context/LoadingContext";
import FullScreenLottie from "./components/Loading/FullScreenLottie";
import ReportExport from "./pages/ReportExport";
import { connectSocket, getSocket } from "./utils/socket";
import { useEffect, useState } from "react";
import ReportTemplate from "./components/ReportTemplate";
import { ThemeProvider } from "./context/ThemeContext";
import AdminRoute from "./routes/AdminRoute";
import { useSelector } from "react-redux";
import AdminUser from "./pages/admin/AdminUser";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTransaction from "./pages/admin/AdminTransaction";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLog from "./pages/admin/AdminLog";
import ChatIcon from "./components/Chat/ChatIcon";
import ChatWidget from "./components/Chat/ChatWidget";
import AdminGoalPage from "./pages/admin/AdminGoalPage";
import AdminBudgetPage from "./pages/admin/AdminBudgetPage";
import PrivateRoute from "./routes/PrivateRoute";
import { useLocation } from "react-router-dom";

function App() {
  const { isAppLoading } = useLoading();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  // ⚠️ State mới cho Chat Widget
  const [isChatOpen, setIsChatOpen] = useState(false);

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
          {/* Route yêu cầu đăng nhập */}
          <Route element={<PrivateRoute />}>
            <Route
              element={
                <MainLayout header={<Header />} sidebar={<BigSideBar />} />
              }
            >
              {/* User routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/transactions" element={<TransactionPage />} />
              <Route path="/goals" element={<GoalPage />} />
              <Route path="/stat" element={<StatPage />} />
              <Route path="/settings" element={<SettingPage />} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUser />} />
                <Route path="transactions" element={<AdminTransaction />} />
                <Route path="budgets" element={<AdminBudgetPage />} />
                <Route path="goals" element={<AdminGoalPage />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="logs" element={<AdminLog />} />
              </Route>
            </Route>
          </Route>
        </Routes>

        {/* ======================================= */}
        {/* ⚠️ Tích hợp Chat Widget/Icon ở đây (Chỉ khi User tồn tại) */}
        {user && user.role === "user" && location.pathname !== "/login" && (
          <>
            <ChatWidget
              isOpen={isChatOpen}
              onClick={() => setIsChatOpen((prev) => !prev)}
            />
            <ChatIcon
              isOpen={isChatOpen}
              onClick={() => setIsChatOpen((prev) => !prev)}
            />
          </>
        )}
        {/* ======================================= */}
      </ThemeProvider>
    </>
  );
}

export default App;
