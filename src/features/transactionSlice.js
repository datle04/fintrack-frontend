import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";
import { merge } from "lodash";

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const initialState = {
    loading: false,
    recurringLoading: false,
    transactions: [],
    recurringTransactions: [],
    total: 0,
    page: 1,
    totalPages: 1,
    shouldRefetch: false,
    error: null
}

export const getTransactions = createAsyncThunk('transaction/getTransactions', async (filter, { rejectWithValue }) => {
    try {
        const { type, category, keyword, startDate, endDate, page = 1} = filter;

        const res = await axiosInstance.get(
            `/api/transaction?type=${type}&category=${category}&keyword=${keyword}&startDate=${startDate}&endDate=${endDate}&page=${page}`
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const adminGetTransactions = createAsyncThunk('admin/transaction/getTransactions', async (filter, { rejectWithValue }) => {
    try {
        const { type = '', category = '', keyword = '', startDate = '', endDate = '', page = 1} = filter;

        const res = await axiosInstance.get(
            `/api/admin/transactions?&type=${type}&category=${category}&keyword=${keyword}&startDate=${startDate}&endDate=${endDate}&page=${page}`, 
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});


export const getTransactionsByMonth = createAsyncThunk('transaction/getTransactionsByMonth', async (date, { rejectWithValue }) => {
    try {
        const {month, year} = date;

        const res = await axiosInstance.get(
            `/api/transaction/by-month?month=${month}&year=${year}`,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/api/transaction`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", 
          },
        }
      );
      console.log(res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  async ({ id, fields }, { rejectWithValue }) => { 
    try {
      const res = await axiosInstance.patch(
        `/api/transaction/${id}`,
        fields, 
        {
          headers: {
            // Quan trọng: Set content type là multipart/form-data
            // Tuy nhiên, tốt nhất là ĐỪNG SET GÌ CẢ nếu dùng FormData thuần, 
            // nhưng với Axios Instance đã config sẵn JSON, ta cần ghi đè:
            "Content-Type": "multipart/form-data", 
          },
        }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getRecurringTransactions = createAsyncThunk(
  "transaction/getRecurringTransactions",
  async (_, thunkAPI) => {
    try {
      // Gọi API bạn vừa viết ở Bước 1
      const res = await axiosInstance.get("/api/transaction/recurring"); 
      return res.data; // Trả về mảng
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const cancelRecurringTransaction = createAsyncThunk(
    "transaction/cancelRecurring",
    async ({id, deleteAll}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/api/transaction/recurring/${id}?deleteAll=${deleteAll}`,
      );
      console.log(res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    } 
    }
)

export const adminUpdateTransaction = createAsyncThunk(
    'admin/transaction/adminUpdateTransaction', async ({ id, fields }, {rejectWithValue }) => {
    try {
        const res = await axiosInstance.patch(
            `/api/admin/transactions/${id}`,
            fields, 
            {
                headers: {
                    "Content-Type": "multipart/form-data", 
                },
            }
        );

        return res.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
    }
)

export const deleteTransaction = createAsyncThunk('transaction/deleteTransaction', async (id, { rejectWithValue}) => {
    try {
        await axiosInstance.delete(
            `/api/transaction/${id}`,
        );

        return id;       
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const adminDeleteTransaction = createAsyncThunk('admin/transaction/adminDeleteTransaction', async ({id, reason}, { rejectWithValue}) => {
    try {
        await axiosInstance.delete(
            `/api/admin/transactions/${id}`,
            {
                data: {reason}
            }
        );

        return id;       
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

const transactionSlice = createSlice({
    name: "transaction",
    initialState,
    reducers: {
        setShouldRefetch: (state) => {
            state.shouldRefetch = false;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getTransactions.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTransactions.fulfilled, (state, action) => {
                
                state.loading = false;

                const { data, total, page, totalPages } = action.payload;

                if (page === 1) {
                    state.transactions = data;
                } else {
                    state.transactions = [...state.transactions, ...data];
                }

                state.total = total;
                state.page = page || 1;
                state.totalPages = totalPages;
                state.error = null;
            })
            .addCase(getTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getTransactionsByMonth.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTransactionsByMonth.fulfilled, (state, action) => {   
                state.loading = false;
                const { data, total, page, totalPages } = action.payload;
                state.transactions = data;
                state.total = total;
                state.page = page || 1;
                state.totalPages = totalPages;
                state.error = null;
            })
            .addCase(getTransactionsByMonth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createTransaction.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                const newTx = action.payload.transaction;
                const txs = state.transactions;
                
                state.loading = false;

                if (!txs.length) return;

                const newDate = new Date(newTx.date).getTime();
                const firstDate = new Date(txs[0].date).getTime();
                const lastDate = new Date(txs[txs.length - 1].date).getTime();

                if (newDate > firstDate) {
                    txs.unshift(newTx);
                    if (txs.length > 10) txs.pop(); 
                }
                else if (newDate <= firstDate && newDate >= lastDate) {
                    state.shouldRefetch = true;
                }
            })
            .addCase(createTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            }) 
            .addCase(updateTransaction.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                state.loading = false;
                console.log(action.payload);
                const updated = action.payload;
                const index = state.transactions.findIndex(tx => tx._id === updated._id);
                if (index !== -1){
                    console.log(state.transactions[index]);
                    
                    state.transactions[index] = updated;
                }
            })
            .addCase(updateTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })  
            .addCase(deleteTransaction.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = state.transactions.filter(tx => tx._id !== action.payload);
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(adminGetTransactions.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminGetTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data;
                state.page = action.payload.page;
                state.total = action.payload.total;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(adminGetTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })  
            .addCase(adminDeleteTransaction.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminDeleteTransaction.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = state.transactions.filter(tx => tx._id !== action.payload);
            })
            .addCase(adminDeleteTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
             .addCase(adminUpdateTransaction.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminUpdateTransaction.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const index = state.transactions.findIndex(tx => tx._id === updated._id);

                if (index !== -1) {
                    const existingUser = state.transactions[index].user; 
                    state.transactions[index] = { ...updated, user: existingUser };
                }
            })
            .addCase(adminUpdateTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })  
            .addCase(getRecurringTransactions.pending, (state) => {
                state.recurringLoading = true;
            })
            .addCase(getRecurringTransactions.fulfilled, (state, action) => {
                state.recurringLoading = false;
                state.recurringTransactions = action.payload; 
            })
            .addCase(getRecurringTransactions.rejected, (state) => {
                state.recurringLoading = false;
            })
            
            .addCase(cancelRecurringTransaction.fulfilled, (state, action) => {
                const { recurringId } = action.payload; 

                if (state.recurringTransactions && state.recurringTransactions.data) {

                    delete state.recurringTransactions.data[recurringId];

                    if (state.recurringTransactions.totalGroups > 0) {
                        state.recurringTransactions.totalGroups -= 1;
                    }
                }
            });
    }
})

export const { setShouldRefetch } = transactionSlice.actions;
export default transactionSlice.reducer;