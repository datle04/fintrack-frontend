import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    error: null,
    stats:[],
    currency: "VND",
}

export const getExpenseStat = createAsyncThunk('stat/getCategoryStat', async (data, { rejectWithValue }) => {
    console.log(data);

    try {
        const { type = "expense", startDate, endDate, currency = "VND" } = data;

        const res = await axiosInstance.get(
            `/api/stats/category-stats?type=${type}&startDate=${startDate}&endDate=${endDate}&currency=${currency}`
        )
        
        return res.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);        
    }
})

const statSlice = createSlice({
    name: 'stat',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getExpenseStat.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getExpenseStat.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload.stats;
                state.currency = action.payload.currency
            })
            .addCase(getExpenseStat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.log(action.payload)
            })
    }
})

export default statSlice.reducer;