import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { selectToken } from './authSlices'; // Import token selector

const API_BASE_URL = 'https://reqres.in/api/users';

// Helper to get headers with token and API key
const getApiHeaders = (token) => ({
  'Content-Type': 'application/json',
  'x-api-key': 'reqres-free-v1', // Add API key for reqres.in
  ...(token && { Authorization: `Bearer ${token}` }),
});

// ---------------------------- FETCH USERS ----------------------------
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue, getState }) => {
    const token = selectToken(getState());
    try {
      const response = await fetch(`${API_BASE_URL}?per_page=100`, {
        headers: getApiHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
      return data.data; // reqres returns users in `data` field
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------- CREATE USER ----------------------------
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue, getState }) => {
    const token = selectToken(getState());
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getApiHeaders(token),
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create user');

      return {
        id: data.id || Date.now(), // Use API-provided ID or fallback
        avatar: userData.avatar || `https://reqres.in/img/faces/${Math.floor(Math.random() * 12) + 1}-image.jpg`,
        ...userData,
        ...data,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------- UPDATE USER ----------------------------
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue, getState }) => {
    const token = selectToken(getState());
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getApiHeaders(token),
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update user');
      
      return { 
        id, 
        ...userData,
        ...data 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------- DELETE USER ----------------------------
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue, getState }) => {
    const token = selectToken(getState());
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}`, {
        method: 'DELETE',
        headers: getApiHeaders(token),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------- INITIAL STATE ----------------------------
const initialState = {
  users: [],
  loading: false,
  error: null,
  searchQuery: '',
};

// ---------------------------- SLICE ----------------------------
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u.id == action.payload.id); // Use == for type flexibility
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u.id != action.payload); // Use != for type flexibility
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ---------------------------- SELECTORS ----------------------------
export const selectUsers = (state) => state.users.users;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectSearchQuery = (state) => state.users.searchQuery;

// Memoized selector for filtered users
export const selectFilteredUsers = createSelector(
  [selectUsers, selectSearchQuery],
  (users, searchQuery) => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }
);

// ---------------------------- EXPORTS ----------------------------
export const { setSearchQuery, clearError, clearUsers } = usersSlice.actions;
export default usersSlice.reducer;