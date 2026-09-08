import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as authService from "@/features/auth/authService";
import type { User } from "@/features/auth/schema";

// 1. State type
interface UsersState {
  data: User[];
  total: number;
  pages: number;
  byId: Record<string, User>;
  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  error: string | null;
}

// 2. Initial state
const initialState: UsersState = {
  data: [],
  total: 0,
  pages: 0,
  byId: {},
  loading: false,
  detailLoading: false,
  saving: false,
  error: null,
};

// 3. Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (qs: string) => authService.listUsers(qs),
);

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (id: string) => authService.getUser(id),
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
    authService.updateUser(id, body),
);

export const setUserActive = createAsyncThunk(
  "users/setUserActive",
  async ({ id, active }: { id: string; active: boolean }) =>
    active ? authService.activateUser(id) : authService.deactivateUser(id),
);

// 4. Slice
const usersSlice = createSlice({
  name: "users",
  initialState,

  // 5. Synchronous reducers
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  // 6. Async reducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.items;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load accounts";
      })
      .addCase(fetchUser.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.byId[action.payload.id] = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.error.message ?? "Failed to load account";
      })
      .addCase(updateUser.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.saving = false;
        state.byId[action.payload.id] = action.payload;
      })
      .addCase(updateUser.rejected, (state) => {
        state.saving = false;
      })
      .addCase(setUserActive.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload;
        const row = state.data.find((u) => u.id === action.payload.id);
        if (row) row.is_active = action.payload.is_active;
      });
  },
});

// 7. Action exports
export const { clearError } = usersSlice.actions;

// 8. Reducer export
export default usersSlice.reducer;
