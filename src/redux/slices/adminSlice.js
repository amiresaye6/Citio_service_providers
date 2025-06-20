import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "https://service-provider.runasp.net/api/Admin";
const REVIEWS_API_URL = "https://service-provider.runasp.net/api/Reviews";
const ORDERS_API_URL = "https://service-provider.runasp.net/api/Orders";

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

// Updated async thunk for fetching all users
export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async (params, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const {
                pageNumber = 1,
                pageSize = 10,
                searchValue,
                sortColumn,
                sortDirection,
                businessTypes,
                minRating,
                maxRating,
                status,
                statuses
            } = params || {};

            const response = await axios.get(`${API_BASE_URL}/all-users`, {
                headers: {
                    accept: 'text/plain',
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    PageNumer: pageNumber,
                    PageSize: pageSize,
                    SearchValue: searchValue,
                    SortColumn: sortColumn,
                    SortDirection: sortDirection,
                    BusinessTypes: businessTypes,
                    MinRating: minRating,
                    MaxRating: maxRating,
                    Status: status,
                    Statuses: statuses
                }
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
    async (params, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const {
                pageNumber = 1,
                pageSize = 10,
                searchValue,
                sortColumn,
                sortDirection,
                businessTypes,
                minRating,
                maxRating,
                status,
                statuses
            } = params || {};

            const response = await axios.get(`${API_BASE_URL}/all-transactions`, {
                headers: {
                    accept: 'text/plain',
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    PageNumer: pageNumber,
                    PageSize: pageSize,
                    SearchValue: searchValue,
                    SortColumn: sortColumn,
                    SortDirection: sortDirection,
                    BusinessTypes: businessTypes,
                    MinRating: minRating,
                    MaxRating: maxRating,
                    Status: status,
                    Statuses: statuses
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch transactions');
        }
    }
);

// Async thunk for fetching user-vendor reviews
export const fetchUserVendorReviews = createAsyncThunk(
    'admin/fetchUserVendorReviews',
    async (params, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const {
                pageNumber = 1,
                pageSize = 10,
                searchValue,
                sortColumn,
                sortDirection,
                businessTypes,
                minRating,
                maxRating,
                status,
                statuses
            } = params || {};

            const response = await axios.get(`${REVIEWS_API_URL}/user-vendor-reviews`, {
                headers: {
                    accept: 'text/plain',
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    PageNumer: pageNumber,
                    PageSize: pageSize,
                    SearchValue: searchValue,
                    SortColumn: sortColumn,
                    SortDirection: sortDirection,
                    BusinessTypes: businessTypes,
                    MinRating: minRating,
                    MaxRating: maxRating,
                    Status: status,
                    Statuses: statuses
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch user-vendor reviews');
        }
    }
);

// Async thunk for fetching all orders
export const fetchAllOrders = createAsyncThunk(
    'admin/fetchAllOrders',
    async (params, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const {
                pageNumber = 1,
                pageSize = 10,
                searchValue,
                sortColumn,
                sortDirection,
                BusinessTypes,
                DateFilter,
                Statuses
            } = params || {};

            // Manually construct query string
            const queryParams = [];
            if (pageNumber) queryParams.push(`PageNumer=${pageNumber}`);
            if (pageSize) queryParams.push(`PageSize=${pageSize}`);
            if (searchValue) queryParams.push(`SearchValue=${encodeURIComponent(searchValue)}`);
            if (sortColumn) queryParams.push(`SortColumn=${encodeURIComponent(sortColumn)}`);
            if (sortDirection) queryParams.push(`SortDirection=${encodeURIComponent(sortDirection)}`);
            if (BusinessTypes && Array.isArray(BusinessTypes)) {
                BusinessTypes.forEach(type => queryParams.push(`BusinessTypes=${encodeURIComponent(type)}`));
            }
            if (DateFilter) queryParams.push(`DateFilter=${encodeURIComponent(DateFilter)}`);
            if (Statuses && Array.isArray(Statuses) && Statuses.length > 0) {
                Statuses.forEach(status => queryParams.push(`Statuses=${encodeURIComponent(status)}`));
            }

            const queryString = queryParams.join('&');
            const url = queryString ? `${ORDERS_API_URL}/all-orders?${queryString}` : `${ORDERS_API_URL}/all-orders`;

            const response = await axios.get(url, {
                headers: {
                    accept: 'text/plain',
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log('Request params:', params);
            console.log('Query string:', queryString);
            console.log('Response data:', response.data);

            return response.data;
        } catch (error) {
            console.error('Error:', error);
            return rejectWithValue(error.response?.data || 'Failed to fetch orders');
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
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false
        },
        transactions: {
            items: []
        },
        reviews: {
            items: [],
            pageNumber: 1,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false
        },
        orders: {
            items: [],
            pageNumber: 1,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false
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
                state.users = {
                    items: action.payload.items,
                    pageNumber: action.payload.pageNumber,
                    totalPages: action.payload.totalPages,
                    hasPreviousPage: action.payload.hasPreviousPage,
                    hasNextPage: action.payload.hasNextPage
                };
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
                state.transactions = {
                    items: action.payload.items,
                    pageNumber: action.payload.pageNumber,
                    totalPages: action.payload.totalPages,
                    hasPreviousPage: action.payload.hasPreviousPage,
                    hasNextPage: action.payload.hasNextPage
                };
            })
            .addCase(fetchAllTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // User Vendor Reviews
            .addCase(fetchUserVendorReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserVendorReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = {
                    items: action.payload.items,
                    pageNumber: action.payload.pageNumber,
                    totalPages: action.payload.totalPages,
                    hasPreviousPage: action.payload.hasPreviousPage,
                    hasNextPage: action.payload.hasNextPage
                };
            })
            .addCase(fetchUserVendorReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // All Orders
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = {
                    items: action.payload.items,
                    pageNumber: action.payload.pageNumber,
                    totalPages: action.payload.totalPages,
                    hasPreviousPage: action.payload.hasPreviousPage,
                    hasNextPage: action.payload.hasNextPage
                };
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;