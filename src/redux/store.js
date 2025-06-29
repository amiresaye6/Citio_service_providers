import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import vendorsReducer from './slices/vendorsSlice';
import productsReducer from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    vendors: vendorsReducer,
    products: productsReducer
  },
});