import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './modalSlice';
import matchReducer from './matchSlice';

export const store = configureStore({
  reducer: {
    playerModal: modalReducer,
    match: matchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
