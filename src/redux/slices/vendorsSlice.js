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

// Fetch vendor details
export const fetchVendorDetails = createAsyncThunk(
    'vendors/fetchVendorDetails',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/Vendors/my-profile`,
                {
                    headers: {
                        accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update vendor profile
export const updateVendorProfile = createAsyncThunk(
    'vendors/updateVendorProfile',
    async (data, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const { formValues, logoFile, bannerFile } = data;

            // Create FormData for multipart/form-data request
            const formData = new FormData();

            // Add form fields
            formData.append('UserName', formValues.userName || '');
            formData.append('BusinessName', formValues.businessName || '');

            // Add files if present
            if (logoFile) {
                formData.append('ProfilePictureUrl', logoFile);
            }

            if (bannerFile) {
                formData.append('CoverImageUrl', bannerFile);
            }

            const response = await axios.put(
                `${API_BASE_URL}/Vendors/update-profile`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchVendorMenu = createAsyncThunk(
    'vendors/fetchVendorMenu',
    async ({ vendorId }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/Vendors/${vendorId}/menu`, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return { vendorId, items: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vendor menu');
        }
    }
);

export const addProduct = createAsyncThunk(
    'vendors/addProduct',
    async (product, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/Products`, product, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to add product');
        }
    }
);

export const updateMenuItem = createAsyncThunk(
    'vendors/updateMenuItem',
    async ({ vendorId, menuItemId, item }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/Vendors/${vendorId}/menu/${menuItemId}`, item, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return { vendorId, menuItemId, item: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update menu item');
        }
    }
);

export const fetchVendorRatings = createAsyncThunk(
    'vendors/fetchVendorRatings',
    async ({ PageNumer = 1, PageSize = 10, SearchValue = '', SortColumn = '', SortDirection = '', Status = null }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const params = { PageNumer, PageSize };
            if (SearchValue) params.SearchValue = SearchValue;
            if (SortColumn) params.SortColumn = SortColumn;
            if (SortDirection) params.SortDirection = SortDirection;
            if (Status !== null) params.Status = Status;

            const response = await axios.get(`${API_BASE_URL}/Vendors/vendors-rating`, {
                params,
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data;
            if (!data.totalCount && data.totalPages && data.items) {
                data.totalCount = data.totalPages * PageSize;
            }

            data.items = data.items.map(item => ({
                id: item.reviewId,
                reviewer: item.customerName,
                product: item.productNameEn,
                rating: item.rating,
                comment: item.comment || '',
                status: 'active', // API doesn't provide status; default to 'active'
                date: item.createdAt.split('T')[0],
                response: '', // API doesn't provide response field; initialize as empty
            }));

            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vendor ratings');
        }
    }
);

export const flagRating = createAsyncThunk(
    'vendors/flagRating',
    async (ratingId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/Vendors/vendors-rating/${ratingId}/flag`, null, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return ratingId;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to flag rating');
        }
    }
);

export const respondToRating = createAsyncThunk(
    'vendors/respondToRating',
    async ({ ratingId, response }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/Vendors/vendors-rating/${ratingId}/respond`, { response }, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return { ratingId, response };
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to respond to rating');
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

export const fetchVendorDashboard = createAsyncThunk(
    'vendors/fetchVendorDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await axios.get(`${API_BASE_URL}/Vendors/vendor-dashboard`, {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vendor dashboard');
        }
    }
);

export const fetchVendorOrders = createAsyncThunk(
    'vendors/fetchVendorOrders',
    async ({
        // vendorId,
        pageNumber = 1,
        pageSize = 10,
        searchValue,
        sortColumn,
        sortDirection,
        businessTypes,
        dateFilter,
        status,
        statuses
    }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const params = {};
            if (pageNumber) params.PageNumer = pageNumber;
            if (pageSize) params.PageSize = pageSize;
            if (searchValue) params.SearchValue = searchValue;
            if (sortColumn) params.SortColumn = sortColumn;
            if (sortDirection) params.SortDirection = sortDirection;
            if (businessTypes && businessTypes.length > 0) params.BusinessTypes = businessTypes;
            if (dateFilter) params.DateFilter = dateFilter;
            if (typeof status !== 'undefined') params.Status = status;
            if (statuses && statuses.length > 0) params.Statuses = statuses;

            const response = await axios.get(
                `${API_BASE_URL}/Orders/vendors`,
                {
                    headers: {
                        accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    },
                    params,
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch vendor orders');
        }
    }
);

export const fetchVendorTopSellingProducts = createAsyncThunk(
    'vendors/fetchVendorTopSellingProducts',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_BASE_URL}/Vendors/vendors-top-selling-products`,
                {
                    headers: {
                        accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch top selling products');
        }
    }
);

export const fetchVendorRevenueByPaymentMethod = createAsyncThunk(
    'vendors/fetchVendorRevenueByPaymentMethod',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/Vendors/vendor-Revenue-ByPaymentMethod`,
                {
                    headers: {
                        accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch revenue by payment method');
        }
    }
);

// Update vendor password action
export const updateVendorPassword = createAsyncThunk(
    'vendors/updateVendorPassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/Vendors/change-password`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
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
        vendorDetails: {},
        vendorMenu: {
            items: [],
        },
        vendorRatings: {
            items: [],
            pageNumber: 1,
            totalPages: 0,
            totalCount: 0,
            hasPreviousPage: false,
            hasNextPage: false,
        },
        vendorOrders: {
            items: [],
            pageNumber: 1,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false,
        },
        vendorRevenueByPaymentMethod: [],
        vendorRevenueByPaymentMethodLoading: false,
        vendorRevenueByPaymentMethodError: null,
        vendorTopSellingProducts: [],
        vendorTopSellingProductsLoading: false,
        vendorTopSellingProductsError: null,
        vendorOrdersLoading: false,
        vendorOrdersError: null,
        subcategories: [],
        dashboard: null,
        loading: false,
        error: null,
        updateLoading: false,
        updateError: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearVendorOrders: (state) => {
            state.vendorOrders = {
                items: [],
                pageNumber: 1,
                totalPages: 1,
                hasPreviousPage: false,
                hasNextPage: false,
            };
            state.vendorOrdersError = null;
        },
        clearUpdateErrors: (state) => {
            state.updateError = null;
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
                state.vendorMenu = {
                    vendorId: action.payload.vendorId,
                    items: action.payload.items,
                };
            })
            .addCase(fetchVendorMenu.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.vendorMenu.items.push(action.payload);
            })
            .addCase(addProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateMenuItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateMenuItem.fulfilled, (state, action) => {
                state.loading = false;
                const { menuItemId, item } = action.payload;
                state.vendorMenu.items = state.vendorMenu.items.map((menuItem) =>
                    menuItem.id === menuItemId ? { ...menuItem, ...item } : menuItem
                );
            })
            .addCase(updateMenuItem.rejected, (state, action) => {
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
            .addCase(flagRating.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(flagRating.fulfilled, (state, action) => {
                state.loading = false;
                const ratingId = action.payload;
                state.vendorRatings.items = state.vendorRatings.items.map((rating) =>
                    rating.id === ratingId ? { ...rating, status: 'error' } : rating
                );
            })
            .addCase(flagRating.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(respondToRating.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(respondToRating.fulfilled, (state, action) => {
                state.loading = false;
                const { ratingId, response } = action.payload;
                state.vendorRatings.items = state.vendorRatings.items.map((rating) =>
                    rating.id === ratingId ? { ...rating, response } : rating
                );
            })
            .addCase(respondToRating.rejected, (state, action) => {
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
            })
            .addCase(fetchVendorDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboard = action.payload;
            })
            .addCase(fetchVendorDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // get vendor orders
            .addCase(fetchVendorOrders.pending, (state) => {
                state.vendorOrdersLoading = true;
                state.vendorOrdersError = null;
            })
            .addCase(fetchVendorOrders.fulfilled, (state, action) => {
                state.vendorOrdersLoading = false;
                state.vendorOrders = {
                    items: action.payload.items,
                    pageNumber: action.payload.pageNumber,
                    totalPages: action.payload.totalPages,
                    hasPreviousPage: action.payload.hasPreviousPage,
                    hasNextPage: action.payload.hasNextPage,
                };
            })
            .addCase(fetchVendorOrders.rejected, (state, action) => {
                state.vendorOrdersLoading = false;
                state.vendorOrdersError = action.payload;
            })
            // get vendor top selling products
            .addCase(fetchVendorTopSellingProducts.pending, (state) => {
                state.vendorTopSellingProductsLoading = true;
                state.vendorTopSellingProductsError = null;
            })
            .addCase(fetchVendorTopSellingProducts.fulfilled, (state, action) => {
                state.vendorTopSellingProductsLoading = false;
                state.vendorTopSellingProducts = action.payload;
            })
            .addCase(fetchVendorTopSellingProducts.rejected, (state, action) => {
                state.vendorTopSellingProductsLoading = false;
                state.vendorTopSellingProductsError = action.payload;
            })
            // get vendor revenue by payment method
            .addCase(fetchVendorRevenueByPaymentMethod.pending, (state) => {
                state.vendorRevenueByPaymentMethodLoading = true;
                state.vendorRevenueByPaymentMethodError = null;
            })
            .addCase(fetchVendorRevenueByPaymentMethod.fulfilled, (state, action) => {
                state.vendorRevenueByPaymentMethodLoading = false;
                state.vendorRevenueByPaymentMethod = action.payload;
            })
            .addCase(fetchVendorRevenueByPaymentMethod.rejected, (state, action) => {
                state.vendorRevenueByPaymentMethodLoading = false;
                state.vendorRevenueByPaymentMethodError = action.payload;
            })
            // Add these to your extraReducers in vendorsSlice
            .addCase(updateVendorProfile.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateVendorProfile.fulfilled, (state, action) => {
                state.updateLoading = false;
                if (action.payload) {
                    state.vendorDetails = {
                        ...state.vendorDetails,
                        ...action.payload
                    };
                }
            })
            .addCase(updateVendorProfile.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            })
            // Add these to your extraReducers in vendorsSlice
            .addCase(updateVendorPassword.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateVendorPassword.fulfilled, (state) => {
                state.updateLoading = false;
                // No need to update state for password change
            })
            .addCase(updateVendorPassword.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            })
    },
});

export const {
    clearError,
    clearVendorOrders,
    clearUpdateErrors,
} = vendorsSlice.actions;

export default vendorsSlice.reducer;