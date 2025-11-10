import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    error: null,
    logs:[],
    page: 1,
    totalPages: 1,
    totalLogs: 0
}

export const adminGetLogs = createAsyncThunk("/admin/logs/adminGetLogs", async (filter, {rejectWithValue}) => {
    const { action = "", method = "", level = "", page = 1, limit = 20, startDate, endDate } = filter;

    try {
        const res = await axiosInstance.get(`/api/admin/logs?action=${action}&method=${method}&level=${level}&page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`)
        return res.data
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
})

const logSlice = createSlice({
  name: "log",
  initialState,
  reducers: {
  clearError: (state) => {
    state.error = null;
  }
},
  extraReducers: (builder) => {
    builder
      .addCase(adminGetLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminGetLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalLogs = action.payload.totalLogs;
      })
      .addCase(adminGetLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
}})

export default logSlice.reducer;

