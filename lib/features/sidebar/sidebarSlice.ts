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
  },
});

export const { toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
