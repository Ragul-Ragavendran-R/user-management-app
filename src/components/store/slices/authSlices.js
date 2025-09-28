import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'https://reqres.in/api';

// Helper to get headers with token and API key
const getApiHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'x-api-key': 'reqres-free-v1', // Add API key for consistency
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ---------------------------- LOGIN ----------------------------
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return {
        token: data.token,
        user: { email: credentials.email }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------- REGISTER ----------------------------
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return {
        token: data.token,
        user: { email: userData.email }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------- LOGOUT ----------------------------
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    // Optional: Call logout API if available
    localStorage.removeItem('authToken');
    return null;
  }
);

// ---------------------------- CHECK AUTH STATUS ----------------------------
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      // For demo: Treat token existence as valid
      return {
        token,
        user: {
          email: 'user@example.com',
          name: 'Demo User'
        }
      };

      // For production, validate token here:
      /*
      const response = await fetch(`${API_BASE_URL}/validate`, {
        headers: getApiHeaders()
      });

      if (!response.ok) throw new Error('Invalid token');

      const userData = await response.json();
      return { token, user: userData };
      */
    } catch (error) {
      localStorage.removeItem('authToken');
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------- INITIAL STATE ----------------------------
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// ---------------------------- SLICE ----------------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('authToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = Date.now();
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
        state.lastLoginAttempt = Date.now();
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // CHECK AUTH
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

// ---------------------------- SELECTORS ----------------------------
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectLastLoginAttempt = (state) => state.auth.lastLoginAttempt;

// ---------------------------- EXPORTS ----------------------------
export const {
  logout,
  clearError,
  resetLoginAttempts,
  incrementLoginAttempts,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;