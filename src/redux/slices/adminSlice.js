import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "https://service-provider.runasp.net/api/Admin";

// Async thunk for fetching today's stats
export const fetchTodayStats = createAsyncThunk(
    'admin/fetchTodayStats',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/today-stats`, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch today stats');
        }
    }
);

// Async thunk for fetching top vendors
export const fetchTopVendors = createAsyncThunk(
    'admin/fetchTopVendors',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/top-vendors`, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch top vendors');
        }
    }
);

// Async thunk for fetching project summary
export const fetchProjectSummary = createAsyncThunk(
    'admin/fetchProjectSummary',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/project-summary`, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch project summary');
        }
    }
);

// Async thunk for fetching all users
export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async ({ pageNumber = 1, pageSize = 10 }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all-users`, {
                params: { pageNumer: pageNumber, pageSize }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch users');
        }
    }
);

// Async thunk for fetching all transactions
export const fetchAllTransactions = createAsyncThunk(
    'admin/fetchAllTransactions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all-transactions`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch transactions');
        }
    }
);

// Async thunk for fetching all users count
export const fetchAllUsersCount = createAsyncThunk(
    'admin/fetchAllUsersCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all-users-count`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch users count');
        }
    }
);

// Async thunk for fetching all transactions count
export const fetchAllTransactionsCount = createAsyncThunk(
    'admin/fetchAllTransactionsCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all-transactions-count`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch transactions count');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        todayStats: {
            newUsersCount: 0,
            ordersCount: 0,
            revenueToday: 0,
            vendorsCount: 0
        },
        topVendors: [],
        projectSummary: {
            totalUsersCount: 0,
            totalVendorsCount: 0,
            totalRevenue: 0
        },
        users: {
            items: [],
            pageNumber: 1,
            pageSize: 10
        },
        transactions: {
            items: []
        },
        usersCount: {
            totalApplicationUsers: 0
        },
        transactionsCount: {
            totalTransactionsCount: 0
        },
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Today Stats
            .addCase(fetchTodayStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTodayStats.fulfilled, (state, action) => {
                state.loading = false;
                state.todayStats = action.payload;
            })
            .addCase(fetchTodayStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Top Vendors
            .addCase(fetchTopVendors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopVendors.fulfilled, (state, action) => {
                state.loading = false;
                state.topVendors = action.payload;
            })
            .addCase(fetchTopVendors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Project Summary
            .addCase(fetchProjectSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.projectSummary = action.payload;
            })
            .addCase(fetchProjectSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // All Users
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users.items = action.payload.items;
                state.users.pageNumber = action.meta.arg.pageNumber;
                state.users.pageSize = action.meta.arg.pageSize;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // All Transactions
            .addCase(fetchAllTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions.items = action.payload.items;
            })
            .addCase(fetchAllTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // All Users Count
            .addCase(fetchAllUsersCount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsersCount.fulfilled, (state, action) => {
                state.loading = false;
                state.usersCount = action.payload;
            })
            .addCase(fetchAllUsersCount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // All Transactions Count
            .addCase(fetchAllTransactionsCount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTransactionsCount.fulfilled, (state, action) => {
                state.loading = false;
                state.transactionsCount = action.payload;
            })
            .addCase(fetchAllTransactionsCount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;