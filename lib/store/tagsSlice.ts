import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as tagsService from "@/features/tags/tagsService";
import type { Tag } from "@/features/tags/schema";

// 1. State type
interface TagsState {
  data: Tag[];
  total: number;
  pages: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// 2. Initial state
const initialState: TagsState = {
  data: [],
  total: 0,
  pages: 0,
  loading: false,
  saving: false,
  error: null,
};

// 3. Async thunks
export const fetchTags = createAsyncThunk(
  "tags/fetchTags",
  async (qs: string) => tagsService.getAll(qs),
);

export const createTag = createAsyncThunk(
  "tags/createTag",
  async (body: Record<string, unknown>) => tagsService.create(body),
);

export const updateTag = createAsyncThunk(
  "tags/updateTag",
  async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
    tagsService.update(id, body),
);

export const deleteTag = createAsyncThunk(
  "tags/deleteTag",
  async (id: string) => tagsService.remove(id),
);

// 4. Slice
const tagsSlice = createSlice({
  name: "tags",
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
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.items;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load tags";
      })
      .addCase(createTag.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateTag.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTag.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateTag.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTag.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateTag.rejected, (state) => {
        state.saving = false;
      });
  },
});

// 7. Action exports
export const { clearError } = tagsSlice.actions;

// 8. Reducer export
export default tagsSlice.reducer;
