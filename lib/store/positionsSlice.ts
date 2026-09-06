import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as positionsService from "@/features/positions/positionsService";
import type { Position } from "@/features/positions/schema";

// 1. State type
interface PositionsState {
  data: Position[];
  total: number;
  pages: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// 2. Initial state
const initialState: PositionsState = {
  data: [],
  total: 0,
  pages: 0,
  loading: false,
  saving: false,
  error: null,
};

// 3. Async thunks
export const fetchPositions = createAsyncThunk(
  "positions/fetchPositions",
  async (qs: string) => positionsService.getAll(qs),
);

export const createPosition = createAsyncThunk(
  "positions/createPosition",
  async (body: Record<string, unknown>) => positionsService.create(body),
);

export const updatePosition = createAsyncThunk(
  "positions/updatePosition",
  async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
    positionsService.update(id, body),
);

export const deletePosition = createAsyncThunk(
  "positions/deletePosition",
  async (id: string) => positionsService.remove(id),
);

// 4. Slice
const positionsSlice = createSlice({
  name: "positions",
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
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.items;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load positions";
      })
      .addCase(createPosition.pending, (state) => {
        state.saving = true;
      })
      .addCase(updatePosition.pending, (state) => {
        state.saving = true;
      })
      .addCase(createPosition.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updatePosition.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createPosition.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updatePosition.rejected, (state) => {
        state.saving = false;
      });
  },
});

// 7. Action exports
export const { clearError } = positionsSlice.actions;

// 8. Reducer export
export default positionsSlice.reducer;
