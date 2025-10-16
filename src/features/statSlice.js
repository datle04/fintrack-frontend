import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    error: null,
    stats:[]
}

export const getExpenseStat = createAsyncThunk('stat/getCategoryStat', async (data, { getState, rejectWithValue }) => {
    const { token } = getState().auth;

    try {
        const { type, startDate, endDate } = data;

        const res = await axios.get(
            `${BACK_END_URL}/api/stats/category-stats?type=${type}&startDate=${startDate}&endDate=${endDate}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
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
                state.stats = action.payload;
            })
            .addCase(getExpenseStat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export default statSlice.reducer;