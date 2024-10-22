import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import {
  TypedUseSelectorHook,
  useDispatch as useDispatchs,
  useSelector as useSelectors
} from 'react-redux';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// hooks
export type RootState = ReturnType<typeof rootReducer>;
export const useSelector: TypedUseSelectorHook<RootState> = useSelectors;

type AppDispatch = typeof store.dispatch;
export const useDispatch = () => useDispatchs<AppDispatch>();
