import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as companyAddressesService from "@/features/company-addresses/companyAddressesService";
import type { CompanyAddress } from "@/features/company-addresses/schema";

// 1. State type
interface CompanyAddressesState {
  data: CompanyAddress[];
  total: number;
  pages: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// 2. Initial state
const initialState: CompanyAddressesState = {
  data: [],
  total: 0,
  pages: 0,
  loading: false,
  saving: false,
  error: null,
};

// 3. Async thunks
export const fetchCompanyAddresses = createAsyncThunk(
  "companyAddresses/fetchCompanyAddresses",
  async (qs: string) => companyAddressesService.getAll(qs),
);

export const createCompanyAddress = createAsyncThunk(
  "companyAddresses/createCompanyAddress",
  async (body: Record<string, unknown>) => companyAddressesService.create(body),
);

export const updateCompanyAddress = createAsyncThunk(
  "companyAddresses/updateCompanyAddress",
  async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
    companyAddressesService.update(id, body),
);

export const deleteCompanyAddress = createAsyncThunk(
  "companyAddresses/deleteCompanyAddress",
  async (id: string) => companyAddressesService.remove(id),
);

// 4. Slice
const positionsSlice = createSlice({
  name: "companyAddresses",
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
      .addCase(fetchCompanyAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.items;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchCompanyAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load locations";
      })
      .addCase(createCompanyAddress.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateCompanyAddress.pending, (state) => {
        state.saving = true;
      })
      .addCase(createCompanyAddress.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateCompanyAddress.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createCompanyAddress.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateCompanyAddress.rejected, (state) => {
        state.saving = false;
      });
  },
});

// 7. Action exports
export const { clearError } = positionsSlice.actions;

// 8. Reducer export
export default positionsSlice.reducer;
