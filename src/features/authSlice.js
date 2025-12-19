import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import axios from "axios";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};


export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/api/auth/register", credentials);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/api/auth/login", credentials);
      return res.data;
    } catch (error) {
      console.log(error);
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
             return rejectWithValue(error.response.data.message);
        }
        return rejectWithValue(JSON.stringify(error.response.data));
      }
      
      return rejectWithValue(error.message || "Lỗi không xác định");
    }
  }
);

// Lấy thông tin user (Access Token cookie tự gửi)
export const getUserInfo = createAsyncThunk(
  "auth/getUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/user/me");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Cập nhật thông tin user
export const updateUser = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch("/api/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Làm mới Access Token (dùng Refresh Token)
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 

      const res = await axios.post(
        `${API_URL}/api/auth/refresh`, 
        {}, 
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 1. Yêu cầu đổi mật khẩu (Gửi Pass cũ -> Nhận OTP)
export const requestChangePassword = createAsyncThunk(
  "auth/requestChangePassword",
  async ({ oldPassword }, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/auth/change-password/request", { oldPassword });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Lỗi hệ thống");
    }
  }
);

// 2. Xác thực và Đổi mật khẩu (Gửi OTP + Pass mới)
export const verifyAndChangePassword = createAsyncThunk(
  "auth/verifyAndChangePassword",
  async ({ otp, newPassword }, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/auth/change-password/verify", { otp, newPassword });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Lỗi hệ thống");
    }
  }
);

// 1. Gửi yêu cầu quên mật khẩu (Gửi Email -> Nhận OTP)
export const forgotPasswordRequest = createAsyncThunk(
  "auth/forgotPasswordRequest",
  async (email, thunkAPI) => {
    try {
      // API: /auth/forgot-password (Public)
      const response = await axiosInstance.post("/api/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Lỗi hệ thống");
    }
  }
);

// 2. Đặt lại mật khẩu (Gửi OTP + Pass mới)
export const resetPasswordExecute = createAsyncThunk(
  "auth/resetPasswordExecute",
  async ({ email, otp, newPassword }, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/auth/reset-password", { 
        email, otp, newPassword 
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Lỗi hệ thống");
    }
  }
);

// Đăng xuất (xoá cookie + refresh token)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    const { refreshToken } = getState().auth;
    try {
      await axiosInstance.post("/api/auth/logout", { refreshToken });
      return true;
    } catch (error) {
      console.warn("Backend logout failed, forcing client logout.");
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ===================== SLICE ===================== //
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
extraReducers: (builder) => {
  // --- REGISTER --- //
  builder
    .addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.error = null;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

  // --- LOGIN --- //
  builder
    .addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      const { user, refreshToken } = action.payload;
      state.loading = false;
      state.user = user;
      state.refreshToken = refreshToken;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(user));
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

  // --- GET USER INFO --- //
  builder
    .addCase(getUserInfo.pending, (state) => {
      state.loading = true;
    })
    .addCase(getUserInfo.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    })
    .addCase(getUserInfo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

  // --- UPDATE PROFILE --- //
  builder
    .addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    })
    .addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

  // --- LOGOUT --- //
  builder
    .addCase(logoutUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("user");
    })
    .addCase(logoutUser.rejected, (state) => {
      state.user = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("user");
    });
},
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
