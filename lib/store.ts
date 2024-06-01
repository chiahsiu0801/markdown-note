import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './features/editor/editorSlice';
import sidebarReducer from './features/sidebar/sidebarSlice';
import noteReducer from './features/note/noteSlice';
import searchReducer from './features/search/searchSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      editor: editorReducer,
      sidebar: sidebarReducer,
      notes: noteReducer,
      search: searchReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
