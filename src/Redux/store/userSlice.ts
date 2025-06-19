import { DashboardRewards } from '@/GraphQuery/query';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  userId: string | null
  circleData?: DashboardRewards | undefined
}

const initialState: UserState = {
  userId: null,
  circleData: undefined
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    clearUserId: (state) => {
      state.userId = null;
    },
    setCircleData: (state, action) => {
      state.circleData = action.payload
    }
  },
});

export const { setUserId, clearUserId, setCircleData } = userSlice.actions;
export default userSlice.reducer;
