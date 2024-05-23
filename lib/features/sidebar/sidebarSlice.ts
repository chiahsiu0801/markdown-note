import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapse: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapse = !state.sidebarCollapse;
    },
    setSidebarCollapse: (state, action) => {
      state.sidebarCollapse = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapse } = sidebarSlice.actions;
export default sidebarSlice.reducer;
