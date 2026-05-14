/**
 * Auth Slice
 * Manages user authentication state, tokens, and profiles.
 */

import { createSlice } from '@reduxjs/toolkit';

// Initial state for authentication
const initialState = {
  user: null,           // Current logged in user object
  token: null,          // JWT Token
  store: null,          // User's assigned store
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Start login process
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Login successful
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.store = action.payload.user.store_id;
    },
    // Login failed
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.store = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
