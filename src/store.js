import { configureStore, combineReducers } from "@reduxjs/toolkit";
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

const rootReducer = (state, action) => {
    if (action.type === logoutUser.fulfilled.type) {
        state = undefined;
    }

    return appReducer(state, action);
};

const store = configureStore({
    reducer: rootReducer,
});

setupAxiosInterceptors(store, axiosInstance);

export default store;