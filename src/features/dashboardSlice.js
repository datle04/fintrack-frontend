import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    currency: "VND",
    error: null,
}

export const getDashboard = createAsyncThunk('dashboard/getDashboard', async (data, { rejectWithValue }) => {
    try {
        const { start, end, currency } = data;
        const res = await axiosInstance.get(
            `/api/dashboard?startDate=${start}&endDate=${end}&currency=${currency}`,
        )
        return res.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder 
            .addCase(getDashboard.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.totalIncome = action.payload.totalIncome;
                state.totalExpense = action.payload.totalExpense;
                state.balance = action.payload.balance;
                state.currency = action.payload.currency;
            })
            .addCase(getDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export default dashboardSlice.reducer;