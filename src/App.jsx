import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import NotFoundPage from "./pages/NotFoundPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { Bot } from "lucide-react";
import AdminSettingPage from "./pages/admin/AdminSettingPage";
import { useTranslation } from "react-i18next";

function App() {
  const { isAppLoading } = useLoading();
  const { i18n } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  // ⚠️ State mới cho Chat Widget
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      i18n.changeLanguage("vi");
    }
  }, [i18n]);

  getSocket().on("test_event", (data) => console.log("TEST OK:", data));

  return (
    <>
      {isAppLoading && <FullScreenLottie />}
      <ThemeProvider>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
                <Route path="settings" element={<AdminSettingPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* ======================================= */}
        {/* ⚠️ Tích hợp Chat Widget/Icon ở đây (Chỉ khi User tồn tại) */}
        {user && user.role === "user" && location.pathname !== "/login" && (
          <>
            {/* ✅ Cách mới (Giữ state, chỉ ẩn bằng CSS) */}
            <ChatWidget
              isOpen={isChatOpen}
              onClick={() => setIsChatOpen(!isChatOpen)}
            />
            {/* Nút Floating Button để mở chat (nếu bạn để nó riêng bên ngoài widget) */}
            <button
              onClick={() => setIsChatOpen(true)}
              className={`fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                isChatOpen ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <Bot size={28} />
            </button>
          </>
        )}
        {/* ======================================= */}
      </ThemeProvider>
    </>
  );
}

export default App;
