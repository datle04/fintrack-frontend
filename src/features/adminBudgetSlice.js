import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

// 1. State khởi tạo
const initialState = {
  budgets: [], 
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
  },
  selectedBudget: null, 
  loading: false,
  error: null,
};

export const fetchAdminBudgets = createAsyncThunk(
  "adminBudgets/fetchBudgets",
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/admin/budget", { params });
      return res.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getBudgetById = createAsyncThunk(
    "adminBudgets/getBudgetById",
    async (budgetId, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/api/admin/budget/${budgetId}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
)

export const updateAdminBudget = createAsyncThunk(
  "adminBudgets/updateBudget",
  async ({ budgetId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/api/admin/budget/${budgetId}`, data);
      return res.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAdminBudget = createAsyncThunk(
  "adminBudgets/deleteBudget",
  async ({ budgetId, reason }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/admin/budget/${budgetId}`, {
        data: { reason },
      });
      return budgetId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const adminBudgetSlice = createSlice({
  name: "adminBudgets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.budgets;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.pages,
          total: action.payload.total,
        };
      })
      .addCase(fetchAdminBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBudgetById.fulfilled, (state, action) => {
        state.selectedBudget = action.payload;
      })
      .addCase(updateAdminBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.map((b) =>
          b._id === action.payload._id ? action.payload : b
        );
      })
      .addCase(deleteAdminBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b._id !== action.payload);
      });
  },
});

export default adminBudgetSlice.reducer;
