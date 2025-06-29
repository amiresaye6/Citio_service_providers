import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://service-provider.runasp.net/api';

// createProduct async thunk
export const createProduct = createAsyncThunk(
    'products/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const formData = new FormData();

            // Append all product data to FormData
            formData.append('NameEn', productData.nameEn);
            formData.append('NameAr', productData.nameAr);
            formData.append('Description', productData.description);
            formData.append('Price', +productData.price);
            formData.append('SubCategoryId', productData.subCategoryId);

            // Handle image file
            if (productData.image) {
                formData.append('Image', productData.image);
            }

            console.log("data", formData);

            const token = localStorage.getItem('token');

            const response = await axios.post(`${API_BASE_URL}/Products`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    }
                });

            console.log(response.data)

            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: error.message });
        }
    }
);

// Async thunk for updating a product
export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ productId, productData }, { rejectWithValue }) => {
        try {
            const formData = new FormData();

            // Append all product data to FormData
            if (productData.nameEn) formData.append('NameEn', productData.nameEn);
            if (productData.nameAr) formData.append('NameAr', productData.nameAr);
            if (productData.description) formData.append('Description', productData.description);
            if (productData.price !== undefined) formData.append('Price', +productData.price);
            if (productData.subCategoryId) formData.append('SubCategoryId', productData.subCategoryId);

            // Handle image file
            if (productData.image) {
                formData.append('Image', productData.image);
            }

            const token = localStorage.getItem('token');

            const response = await axios.put(`${API_BASE_URL}/Products/${productId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    }
                });

            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: error.message });
        }
    }
);

// Async thunk for fetching a single product by ID
export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (productId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/Products/${productId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: error.message });
        }
    }
);

//fetching allowed subcategories for the provider
export const fetchProviderSubcategories = createAsyncThunk(
    'products/fetchProviderSubcategories',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_BASE_URL}/SubCategory/SubCategories`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: error.message });
        }
    }
);

// Delete product async thunk
export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (productId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');

            const _ = await axios.delete(`${API_BASE_URL}/Products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Return the deleted product ID for state updates
            return productId;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: error.message });
        }
    }
);


// Initial state for the products slice
const initialState = {
    product: null,
    productCreationLoading: false,
    productCreationError: null,
    productUpdateLoading: false,
    productUpdateError: null,
    providerSubcategories: [],
    providerSubcategoriesLoading: false,
    providerSubcategoriesError: null,
    currentProduct: null,
    productLoading: false,
    productError: null,
    products: [],
    productsLoading: false,
    productsError: null,
    productDeleteLoading: false,
    productDeleteError: null,
};

// Create the products slice
const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearProductCreationError: (state) => {
            state.productCreationError = null;
        },
        clearProductData: (state) => {
            state.product = null;
        },
        clearProviderSubcategories: (state) => {
            state.providerSubcategories = [];
            state.providerSubcategoriesError = null;
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
        clearProductError: (state) => {
            state.productError = null;
        },
        clearProductUpdateError: (state) => {
            state.productUpdateError = null;
        },
        clearProductDeleteError: (state) => {
            state.productDeleteError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle createProduct async thunk
            .addCase(createProduct.pending, (state) => {
                state.productCreationLoading = true;
                state.productCreationError = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.productCreationLoading = false;
                state.product = action.payload;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.productCreationLoading = false;
                state.productCreationError = action.payload;
            })
            // Handle updateProduct async thunk
            .addCase(updateProduct.pending, (state) => {
                state.productUpdateLoading = true;
                state.productUpdateError = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.productUpdateLoading = false;
                state.currentProduct = action.payload;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.productUpdateLoading = false;
                state.productUpdateError = action.payload;
            })
            // Handle fetchProductById async thunk
            .addCase(fetchProductById.pending, (state) => {
                state.productLoading = true;
                state.productError = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.productLoading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.productLoading = false;
                state.productError = action.payload;
            })
            // Handle fetchProviderSubcategories async thunk
            .addCase(fetchProviderSubcategories.pending, (state) => {
                state.providerSubcategoriesLoading = true;
                state.providerSubcategoriesError = null;
            })
            .addCase(fetchProviderSubcategories.fulfilled, (state, action) => {
                state.providerSubcategoriesLoading = false;
                state.providerSubcategories = action.payload;
            })
            .addCase(fetchProviderSubcategories.rejected, (state, action) => {
                state.providerSubcategoriesLoading = false;
                state.providerSubcategoriesError = action.payload;
            })
            // Add these cases to extraReducers
            .addCase(deleteProduct.pending, (state) => {
                state.productDeleteLoading = true;
                state.productDeleteError = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.productDeleteLoading = false;
                // Remove the deleted product from the products array if it exists there
                state.products = state.products.filter(product => product.id !== action.payload);
                // Clear the currentProduct if it's the one that was deleted
                if (state.currentProduct && state.currentProduct.id === action.payload) {
                    state.currentProduct = null;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.productDeleteLoading = false;
                state.productDeleteError = action.payload;
            })
    },
});

// Export actions
export const {
    clearCurrentProduct,
    clearProductError,
    clearProductCreationError,
    clearProductData,
    clearProviderSubcategories,
    clearProductUpdateError,
    clearProductDeleteError
} = productsSlice.actions;

// Export reducer
export default productsSlice.reducer;