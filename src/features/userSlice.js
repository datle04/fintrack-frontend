import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    error: null,
    users:[],
    page: 1,
    totalPages: 1,
    totalUsers: 0
}

export const adminGetUsers = createAsyncThunk(
  "admin/user/adminGetUsers",
  async (filter, { rejectWithValue }) => {

    const { name, email, role, isBanned, limit = 20, page = 1} = filter;

    try {
      const res = await axiosInstance.get(`/api/admin/users/?name=${name}&email=${email}&role=${role}&isBanned=${isBanned}&limit=${limit}&page=${page}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const adminDeleteUser = createAsyncThunk("admin/user/adminDeleteUser", async ({id, reason}, { rejectWithValue}) => {
    try {
        const res = await axiosInstance.delete(`/api/admin/users/${id}`, {reason});
        return res.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
})

export const adminUpdateUser = createAsyncThunk("admin/user/adminUpdateUser", async ({id, formData}, { rejectWithValue }) => {
  try {
      const res = await axiosInstance.put(`/api/admin/users/${id}`, formData);
      return res.data;
  } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
  }
})

export const adminBanUser = createAsyncThunk("admin/user/adminBanUser", async ({id, reason}, { rejectWithValue}) => {
  try {
      const res = await axiosInstance.patch(`/api/admin/users/${id}/ban`, {reason});
      return res.data;
  } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
  }
})

export const adminUnbanUser = createAsyncThunk("admin/user/adminUnbanUser", async (id, { rejectWithValue}) => {
  try {
      const res = await axiosInstance.patch(`/api/admin/users/${id}/unban`, {});
      return res.data;
  } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
  }
})


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
  clearError: (state) => {
    state.error = null;
  }
},
  extraReducers: (builder) => {
    builder
      .addCase(adminGetUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminGetUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalUsers = action.payload.totalUsers;
      })
      .addCase(adminGetUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminUpdateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminUpdateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
            state.users[index] = action.payload; 
        }
       })
      .addCase(adminUpdateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminDeleteUser.pending, (state, action) => {
        state.error = action.payload;
      })
      .addCase(adminDeleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload.id;
        console.log(action.payload);
        
        state.users = state.users.filter(item => item._id !== id);
      })
      .addCase(adminDeleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminBanUser.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(adminBanUser.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload.user;
        const index = state.users.findIndex(item => item._id === user._id);
        if (index !== -1) {
            state.users[index] = user; 
        }
      })
      .addCase(adminBanUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminUnbanUser.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(adminUnbanUser.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload.user;
        const index = state.users.findIndex(item => item._id === user._id);
        if (index !== -1) {
            state.users[index] = user; 
        }
      })
      .addCase(adminUnbanUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
