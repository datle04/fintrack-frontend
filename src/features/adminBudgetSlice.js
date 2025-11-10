import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

// 1. State khởi tạo
const initialState = {
  budgets: [], // Mảng ngân sách
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
  },
  selectedBudget: null, // Dùng cho modal chỉnh sửa
  loading: false,
  error: null,
};

// 2. Thunk: Fetch danh sách budgets (có phân trang + filter)
export const fetchAdminBudgets = createAsyncThunk(
  "adminBudgets/fetchBudgets",
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/admin/budget", { params });
      return res.data; // { budgets: [], total, page, pages }
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

// 3. Thunk: Update budget (gửi kèm reason)
export const updateAdminBudget = createAsyncThunk(
  "adminBudgets/updateBudget",
  async ({ budgetId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/api/admin/budget/${budgetId}`, data);
      return res.data; // Budget sau khi update
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 4. Thunk: Delete budget (gửi reason trong body)
export const deleteAdminBudget = createAsyncThunk(
  "adminBudgets/deleteBudget",
  async ({ budgetId, reason }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/admin/budget/${budgetId}`, {
        data: { reason },
      });
      return budgetId; // Trả ID để xóa trong state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 5. Slice chính
const adminBudgetSlice = createSlice({
  name: "adminBudgets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
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
      // Update
      .addCase(updateAdminBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.map((b) =>
          b._id === action.payload._id ? action.payload : b
        );
      })
      // Delete
      .addCase(deleteAdminBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b._id !== action.payload);
      });
  },
});

// 6. Export action & reducer
export default adminBudgetSlice.reducer;
