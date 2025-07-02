// ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://service-provider.runasp.net/api';

// Async thunk for fetching vendor orders
export const fetchVendorOrders = createAsyncThunk(
    'orders/fetchVendorOrders',
    async (params = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');

            // Build query parameters
            const queryParams = new URLSearchParams();

            // Required parameters

            // // Pagination parameters
            if (params.pageNumber) queryParams.append('PageNumer', params.pageNumber); // Note the typo in API: "PageNumer"
            if (params.pageSize) queryParams.append('PageSize', params.pageSize);

            // // Filtering and sorting parameters
            if (params.dateFilter) queryParams.append('DateFilter', params.dateFilter);

            if (params.statuses && params.statuses.length) {
                params.statuses.forEach(status => {
                    queryParams.append('Statuses', status);
                });
            }

            const queryString = queryParams.toString();
            const url = `${API_BASE_URL}/Orders/vendors${queryString ? `?${queryString}` : ''}`;

            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });

            // Add metadata for tracking
            const metadata = {
                fetchedBy: 'amiresaye6',
                fetchTimestamp: '2025-06-30 19:39:11', // Using the provided timestamp
            };

            return { ...response.data, metadata };
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: error.message });
        }
    }
);

// Async thunk for updating order status
export const updateOrderStatus = createAsyncThunk(
    'orders/updateOrderStatus',
    async ({ orderId, newStatus }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.put(
                `${API_BASE_URL}/Orders/${orderId}/status`,
                { newStatus },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            // Add metadata for tracking
            const metadata = {
                updatedBy: 'amiresaye6',
                updateTimestamp: '2025-06-30 19:39:11', // Using the provided timestamp
                previousStatus: null, // This will be filled in the component before dispatch
            };

            return { ...response.data, metadata };
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: error.message });
        }
    }
);

// Initial state for the orders slice
const initialState = {
    // Orders list data
    vendorOrders: {
        items: [],
        pageNumber: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
        metadata: null
    },
    vendorOrdersLoading: false,
    vendorOrdersError: null,

    // Order status update
    orderUpdateLoading: false,
    orderUpdateError: null,
    updatedOrder: null,

    // Selected order for viewing details
    selectedOrder: null,

    // Filters and pagination state (for persistence between navigations)
    filters: {
        pageNumber: 1,
        pageSize: 10,
        searchValue: '',
        sortColumn: 'orderDate',
        sortDirection: 'desc',
        statuses: []
    }
};

// Create the orders slice
const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        // Clear errors
        clearVendorOrdersError: (state) => {
            state.vendorOrdersError = null;
        },
        clearOrderUpdateError: (state) => {
            state.orderUpdateError = null;
        },

        // Clear updated order data (after handling the update)
        clearUpdatedOrder: (state) => {
            state.updatedOrder = null;
        },

        // Set selected order for details view
        setSelectedOrder: (state, action) => {
            state.selectedOrder = action.payload;
        },
        clearSelectedOrder: (state) => {
            state.selectedOrder = null;
        },

        // Update filters
        updateFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },
        clearFilters: (state) => {
            state.filters = {
                pageNumber: 1,
                pageSize: 10,
                searchValue: '',
                sortColumn: 'orderDate',
                sortDirection: 'desc',
                statuses: []
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle fetchVendorOrders async thunk
            .addCase(fetchVendorOrders.pending, (state) => {
                state.vendorOrdersLoading = true;
                state.vendorOrdersError = null;
            })
            .addCase(fetchVendorOrders.fulfilled, (state, action) => {
                state.vendorOrdersLoading = false;
                state.vendorOrders = action.payload;
            })
            .addCase(fetchVendorOrders.rejected, (state, action) => {
                state.vendorOrdersLoading = false;
                state.vendorOrdersError = action.payload;
            })

            // Handle updateOrderStatus async thunk
            .addCase(updateOrderStatus.pending, (state) => {
                state.orderUpdateLoading = true;
                state.orderUpdateError = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.orderUpdateLoading = false;
                state.updatedOrder = action.payload;

                // Update the order in the list if it exists there
                const orderIndex = state.vendorOrders.items.findIndex(
                    order => order.id === action.payload.id
                );

                if (orderIndex !== -1) {
                    state.vendorOrders.items[orderIndex] = {
                        ...state.vendorOrders.items[orderIndex],
                        status: action.payload.status
                    };
                }

                // Update the selected order if it's the same one
                if (state.selectedOrder && state.selectedOrder.id === action.payload.id) {
                    state.selectedOrder = {
                        ...state.selectedOrder,
                        status: action.payload.status
                    };
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.orderUpdateLoading = false;
                state.orderUpdateError = action.payload;
            });
    },
});

// Export actions
export const {
    clearVendorOrdersError,
    clearOrderUpdateError,
    clearUpdatedOrder,
    setSelectedOrder,
    clearSelectedOrder,
    updateFilters,
    clearFilters
} = ordersSlice.actions;

// Export reducer
export default ordersSlice.reducer;