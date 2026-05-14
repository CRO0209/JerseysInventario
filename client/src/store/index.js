/**
 * Redux Toolkit Store Configuration
 * Centralized state for the entire application.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';

export const store = configureStore({
  reducer: {
    // Authentication and User State
    auth: authReducer,
    // Future slices: inventory, sales, etc.
  },
  // Middleware: Useful for custom logic (e.g., logging)
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable for easier handling of complex objects if needed
    }),
});
