import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { TruckElectric } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    month: null,
    year: null,
    originalAmount: 0,
    totalBudget: 0,
    totalSpent: 0,
    totalPercentUsed: 0,
    currency: "VND",
    categoryStats: [],
    error: null,
}

export const addBudget = createAsyncThunk('budget/addBudget', async ({ month, year, totalAmount, currency, categories}, { rejectWithValue }) => {
    try {
        // const { month, year, amount, categories } = fields;

        const res = await axiosInstance.post(
            `/api/budget`,
            {
                month,
                year,
                totalAmount,
                currency,
                categories
            },
        )

        return res.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
})

export const getBudget = createAsyncThunk('budget/getBudget', async (fields, { rejectWithValue }) => {
    try {
        const { month, year } = fields;

        const res = await axiosInstance.get(
            `/api/budget?month=${month}&year=${year}`,
        );

        return res.data;

    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
})

export const deleteBudget = createAsyncThunk('budget/deleteBudget', async ({month, year}, {rejectWithValue}) => {
    try {
        const res = await axiosInstance.delete(
            `/api/budget?month=${month}&year=${year}`,
        );
        return res.data; 
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
})

const budgetSlice = createSlice({
    name: 'budget',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(addBudget.pending, state => {
                state.loading = true;
                state.error = null
            })
            .addCase(addBudget.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(addBudget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBudget.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBudget.fulfilled, (state, action) => {
                state.loading = false;
                state.month = action.payload.month;
                state.year = action.payload.year;
                state.originalAmount = action.payload.originalAmount;
                state.totalBudget = action.payload.totalBudget;
                state.totalSpent = action.payload.totalSpent;
                state.totalPercentUsed = action.payload.totalPercentUsed;
                state.currency = action.payload.originalCurrency;
                state.categoryStats = action.payload.categoryStats;
            })
            .addCase(getBudget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.totalBudget = 0;
                state.totalSpent = 0;
                state.totalPercentUsed = 0;
                state.categoryStats = [];
            })
            .addCase(deleteBudget.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBudget.fulfilled, (state, action) => {
                state.loading = false;
                state.month = action.payload.month;
                state.year = action.payload.year;
                state.originalAmount = 0;
                state.totalBudget = 0;
                state.totalSpent = 0;
                state.totalPercentUsed = 0;
                state.currency = "";
                state.categoryStats = [];
            })
            .addCase(deleteBudget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export default budgetSlice.reducer;