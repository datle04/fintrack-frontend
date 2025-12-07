import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    notifications: [],
    error: null,
}

export const getNotifications = createAsyncThunk('notification/getNotification', async (__, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.get(
            `/api/notification/`,
        )
        
        return res.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const markNotificationAsRead = createAsyncThunk('notificaiton/markNotificationAsRead', async (id, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.patch(
            `/api/notification/${id}/read`,
            {},
        )

        return res.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);        
    }
})

export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // Gọi đúng route bạn vừa tạo ở backend
      const res = await axiosInstance.delete('/api/notification/delete-all');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk('notification/deleteNotification', async (id, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.delete(
            `/api/notification/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        return res.data
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
})

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNewNotification: (state, action) => {
            const newNotification = action.payload;
            
            // 1. Kiểm tra trùng lặp (Best Practice)
            // Đôi khi mạng lag hoặc logic sai khiến socket gửi 2 lần, nên check trước
            const exists = state.notifications.some(
                (n) => n._id === newNotification._id
            );

            if (!exists) {
                // 2. Thêm vào ĐẦU mảng để nó hiện lên trên cùng
                state.notifications.unshift(newNotification);
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getNotifications.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
            })
            .addCase(getNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markNotificationAsRead.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const index = state.notifications.findIndex(notification => notification._id === action.payload._id);
                state.notifications[index] = updated;
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = state.notifications.filter(notification => notification.id !== action.payload.id);
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteAllNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteAllNotifications.fulfilled, (state) => {
                state.loading = false;
                state.notifications = []; // Xóa sạch mảng local để UI cập nhật ngay lập tức
            })
            .addCase(deleteAllNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
        }
});

export const { addNewNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

