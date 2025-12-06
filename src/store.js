import { configureStore, combineReducers } from "@reduxjs/toolkit";
// 1. Import action logoutUser để bắt sự kiện
import authReducer, { logoutUser } from './features/authSlice'; 

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

// 2. Gộp tất cả các slice reducer lại thành appReducer
const appReducer = combineReducers({
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
});

// 3. Tạo Root Reducer để xử lý việc Reset State
const rootReducer = (state, action) => {
    // Kiểm tra nếu action là logout thành công
    // Lưu ý: Nếu bạn muốn reset kể cả khi logout API lỗi, 
    // bạn có thể thêm: || action.type === logoutUser.rejected.type
    if (action.type === logoutUser.fulfilled.type) {
        // Gán state về undefined để Redux khởi tạo lại tất cả về initialState
        state = undefined;
    }

    return appReducer(state, action);
};

// 4. Cấu hình store với rootReducer
const store = configureStore({
    reducer: rootReducer,
    // Middleware mặc định đã bao gồm thunk, không cần thêm thủ công trừ khi bạn muốn custom
});

// Gắn interceptor sau khi store sẵn sàng
setupAxiosInterceptors(store, axiosInstance);

export default store;