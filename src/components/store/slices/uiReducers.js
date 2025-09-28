import { createSlice, createSelector } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // View mode for users list
  viewMode: 'table', // 'table' or 'card'
  
  // Modal states
  isUserModalOpen: false,
  modalMode: 'create', // 'create' or 'edit'
  selectedUser: null,
  
  // Delete confirmation
  deleteConfirmUser: null,
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 10,
  
  // Notifications
  notifications: [],
  
  // Loading states for UI actions
  isDeleting: false,
  isSaving: false,
  
  // Sidebar/navigation
  sidebarOpen: false,
  
  // Theme
  theme: 'light', // 'light' or 'dark'
  
  // Filters and sorting
  sortField: null,
  sortDirection: 'asc', // 'asc' or 'desc'
  activeFilters: {},
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // View mode actions
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Modal actions
    openUserModal: (state, action) => {
      state.isUserModalOpen = true;
      state.modalMode = action.payload.mode;
      state.selectedUser = action.payload.user || null;
    },
    
    closeUserModal: (state) => {
      state.isUserModalOpen = false;
      state.modalMode = 'create';
      state.selectedUser = null;
    },
    
    // Delete confirmation actions
    setDeleteConfirmUser: (state, action) => {
      state.deleteConfirmUser = action.payload;
    },
    
    clearDeleteConfirmUser: (state) => {
      state.deleteConfirmUser = null;
    },
    
    // Pagination actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    
    resetPagination: (state) => {
      state.currentPage = 1;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading states
    setDeleting: (state, action) => {
      state.isDeleting = action.payload;
    },
    
    setSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Sorting actions
    setSorting: (state, action) => {
      const { field, direction } = action.payload;
      state.sortField = field;
      state.sortDirection = direction;
    },
    
    toggleSort: (state, action) => {
      const field = action.payload;
      if (state.sortField === field) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortDirection = 'asc';
      }
    },
    
    clearSort: (state) => {
      state.sortField = null;
      state.sortDirection = 'asc';
    },
    
    // Filter actions
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || value === '') {
        delete state.activeFilters[key];
      } else {
        state.activeFilters[key] = value;
      }
    },
    
    clearFilter: (state, action) => {
      delete state.activeFilters[action.payload];
    },
    
    clearAllFilters: (state) => {
      state.activeFilters = {};
    },
    
    // Reset UI state
    resetUIState: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Preserve theme preference
      };
    },
  },
});

// Selectors
export const selectViewMode = (state) => state.ui.viewMode;

// Modal selectors
export const selectIsUserModalOpen = (state) => state.ui.isUserModalOpen;
export const selectModalMode = (state) => state.ui.modalMode;
export const selectSelectedUser = (state) => state.ui.selectedUser;

// Delete confirmation selectors
export const selectDeleteConfirmUser = (state) => state.ui.deleteConfirmUser;

// Pagination selectors
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectItemsPerPage = (state) => state.ui.itemsPerPage;

// Memoized pagination data selector
export const selectPaginationData = createSelector(
  [selectCurrentPage, selectItemsPerPage, (state) => state.users?.users?.length || 0],
  (currentPage, itemsPerPage, totalItems) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      currentPage,
      itemsPerPage,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }
);

// Notification selectors
export const selectNotifications = (state) => state.ui.notifications;
export const selectNotificationCount = (state) => state.ui.notifications.length;

// Loading state selectors
export const selectIsDeleting = (state) => state.ui.isDeleting;
export const selectIsSaving = (state) => state.ui.isSaving;

// Sidebar selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;

// Theme selectors
export const selectTheme = (state) => state.ui.theme;
export const selectIsDarkMode = (state) => state.ui.theme === 'dark';

// Sorting selectors
export const selectSortField = (state) => state.ui.sortField;
export const selectSortDirection = (state) => state.ui.sortDirection;
export const selectSortConfig = (state) => ({
  field: state.ui.sortField,
  direction: state.ui.sortDirection,
});

// Filter selectors
export const selectActiveFilters = (state) => state.ui.activeFilters;
export const selectFilterCount = (state) => Object.keys(state.ui.activeFilters).length;

// Composite selectors
export const selectModalState = createSelector(
  [selectIsUserModalOpen, selectModalMode, selectSelectedUser],
  (isOpen, mode, user) => ({
    isOpen,
    mode,
    user,
  })
);

// Export actions
export const {
  // View mode
  setViewMode,
  
  // Modal actions
  openUserModal,
  closeUserModal,
  
  // Delete confirmation
  setDeleteConfirmUser,
  clearDeleteConfirmUser,
  
  // Pagination
  setCurrentPage,
  setItemsPerPage,
  resetPagination,
  
  // Notifications
  addNotification,
  removeNotification,
  clearAllNotifications,
  
  // Loading states
  setDeleting,
  setSaving,
  
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  
  // Theme
  setTheme,
  toggleTheme,
  
  // Sorting
  setSorting,
  toggleSort,
  clearSort,
  
  // Filters
  setFilter,
  clearFilter,
  clearAllFilters,
  
  // Reset
  resetUIState,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;