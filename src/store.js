import { configureStore } from "@reduxjs/toolkit";
import authReducer from './features/authSlice';
import transactionReducer from './features/transactionSlice';
import dashboardReducer from './features/dashboardSlice';
import budgetReducer from './features/budgetSlice';
import notificationReducer from './features/notificationSlice';
import statReducer from './features/statSlice';
import userReducer from './features/userSlice';
import logReducer from './features/logSlice';
import goalReducer from './features/goalSlice';
import adminBudgetReducer from './features/adminBudgetSlice';
import adminDashboardReducer from './features/adminDashboard';
import { setupAxiosInterceptors } from './api/setupAxios';
import axiosInstance from './api/axiosInstance';

const store = configureStore({
    reducer: {
        auth: authReducer,
        transaction: transactionReducer,
        dashboard: dashboardReducer,
        budget: budgetReducer,
        notification: notificationReducer,
        stat: statReducer,
        users: userReducer,
        log: logReducer,
        goals: goalReducer,
        adminDashboard: adminDashboardReducer,
        adminBudgets: adminBudgetReducer
    }
});

// Gắn interceptor sau khi store sẵn sàng
setupAxiosInterceptors(store, axiosInstance);

export default store;