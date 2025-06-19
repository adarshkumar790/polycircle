import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import { UserState } from './userSlice'; 

interface AppState {
  user: UserState;
}

const loadState = (): AppState | undefined => {
  try {
    const serializedState = localStorage.getItem("reduxState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};

const saveState = (state: AppState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("reduxState", serializedState);
  } catch (err) {
  }
};

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: loadState(),
});

store.subscribe(() => {
  saveState({
    user: store.getState().user,
  });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
