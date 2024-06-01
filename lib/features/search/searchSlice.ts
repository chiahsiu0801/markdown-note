import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false, 
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    onOpen: (state) => {
      state.isOpen = true;
    },
    onClose: (state) => {
      state.isOpen = false;
    },
    toggle: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { onOpen, onClose, toggle } = searchSlice.actions;
export default searchSlice.reducer;