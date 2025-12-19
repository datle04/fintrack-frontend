// src/features/goalSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    goals: [],
    error: null,
};

// Thunks (CRUD APIs)
export const createGoal = createAsyncThunk(
    "goal/createGoal",
    async (formData, { rejectWithValue }) => {
        console.log(formData);
        try {
            const res = await axiosInstance.post(`/api/goals`, formData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getGoals = createAsyncThunk(
    "goal/getGoals",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/api/goals`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateGoal = createAsyncThunk(
    "goal/updateGoal",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/api/goals/${id}`, formData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteGoal = createAsyncThunk(
    "goal/deleteGoal",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/goals/${id}`);
            return id; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


const goalSlice = createSlice({
    name: "goal",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getGoals.pending, (state) => {
                state.loading = true;
            })
            .addCase(getGoals.fulfilled, (state, action) => {
                state.loading = false;
                state.goals = action.payload;
            })
            .addCase(getGoals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createGoal.fulfilled, (state, action) => {
                state.goals.unshift(action.payload);
            })
            .addCase(updateGoal.fulfilled, (state, action) => {
                console.log(action.payload);
                
                const index = state.goals.findIndex((goal) => goal._id === action.payload._id);
                if (index !== -1) {
                    state.goals[index] = action.payload;
                }
            })
            .addCase(deleteGoal.fulfilled, (state, action) => {
                state.goals = state.goals.filter((goal) => goal._id !== action.payload);
            });
    },
});

export default goalSlice.reducer;