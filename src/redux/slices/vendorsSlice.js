import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { register } from './authSlice';

const API_BASE_URL = 'https://service-provider.runasp.net/api';

export const fetchVendors = createAsyncThunk(
    'vendors/fetchVendors',
    async ({ PageNumer = 1, PageSize = 10, SearchValue = '', Status = null, SortColumn = '', SortDirection = '' }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const params = { PageNumer, PageSize };
            if (SearchValue) params.SearchValue = SearchValue;
            if (Status !== null) params.Status = Status;
            if (SortColumn) params.SortColumn = SortColumn;
            if (SortDirection) params.SortDirection = SortDirection;

            const response = await axios.get(`${API_BASE_URL}/Vendors`, {
                params,
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });

            // Calculate totalCount if not provided
            const data = response.data;
            if (!data.totalCount && data.totalPages && data.items) {
                data.totalCount = data.totalPages * PageSize;
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vendors');
        }
    }
);

export const approveVendor = createAsyncThunk(
    'vendors/approveVendor',
    async (vendorId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/Vendors/approve-vendor/${vendorId}`, null, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return vendorId;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to approve vendor');
        }
    }
);

export const fetchVendorDetails = createAsyncThunk(
    'vendors/fetchVendorDetails',
    async (vendorId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/Vendors/${vendorId}`, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vendor details');
        }
    }
);

export const fetchVendorMenu = createAsyncThunk(
    'vendors/fetchVendorMenu',
    async (vendorId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/Vendors/${vendorId}/menu`, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vendor menu');
        }
    }
);

export const fetchVendorRatings = createAsyncThunk(
    'vendors/fetchVendorRatings',
    async ({ PageNumer = 1, PageSize = 10 }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/Vendors/vendors-rating`, {
                params: { PageNumer, PageSize },
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vendor ratings');
        }
    }
);

export const deactivateVendor = createAsyncThunk(
    'vendors/deactivateVendor',
    async (vendorId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/Vendors/deactivate-vendor/${vendorId}`, null, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return vendorId;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to deactivate vendor');
        }
    }
);

export const fetchSubcategories = createAsyncThunk(
    'vendors/fetchSubcategories',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/SubCategory`, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch subcategories');
        }
    }
);

const vendorsSlice = createSlice({
    name: 'vendors',
    initialState: {
        vendors: {
            items: [],
            pageNumber: 1,
            totalPages: 0,
            totalCount: 0,
            hasPreviousPage: false,
            hasNextPage: false,
        },
        vendorDetails: null,
        vendorMenu: null,
        subcategories: [],
        vendorRatings: {
            items: [],
            pageNumber: 1,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
        },
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                const newVendor = action.payload;
                if (newVendor && newVendor.id) {
                    state.vendors.items.push(newVendor);
                    state.vendors.totalCount += 1;
                }
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchVendors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendors.fulfilled, (state, action) => {
                state.loading = false;
                state.vendors = action.payload;
            })
            .addCase(fetchVendors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(approveVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveVendor.fulfilled, (state, action) => {
                state.loading = false;
                const vendorId = action.payload;
                state.vendors.items = state.vendors.items.map((vendor) =>
                    vendor.id === vendorId ? { ...vendor, isApproved: true } : vendor
                );
                if (state.vendorDetails && state.vendorDetails.id === vendorId) {
                    state.vendorDetails.isApproved = true;
                }
            })
            .addCase(approveVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchVendorDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.vendorDetails = action.payload;
            })
            .addCase(fetchVendorDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchVendorMenu.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorMenu.fulfilled, (state, action) => {
                state.loading = false;
                state.vendorMenu = action.payload;
            })
            .addCase(fetchVendorMenu.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchVendorRatings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorRatings.fulfilled, (state, action) => {
                state.loading = false;
                state.vendorRatings = action.payload;
            })
            .addCase(fetchVendorRatings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deactivateVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deactivateVendor.fulfilled, (state, action) => {
                state.loading = false;
                const vendorId = action.payload;
                state.vendors.items = state.vendors.items.filter(
                    (vendor) => vendor.id !== vendorId
                );
                state.vendors.totalCount -= 1;
                if (state.vendorDetails && state.vendorDetails.id === vendorId) {
                    state.vendorDetails = null;
                }
            })
            .addCase(deactivateVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSubcategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubcategories.fulfilled, (state, action) => {
                state.loading = false;
                state.subcategories = action.payload;
            })
            .addCase(fetchSubcategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = vendorsSlice.actions;
export default vendorsSlice.reducer;