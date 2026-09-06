import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { StatusStats } from "@/features/applications/schema";
import * as dashboardService from "@/features/dashboard/dashboardService";

// 1. State type
interface DashboardState {
  applications: StatusStats | null;
  jobPosts: StatusStats | null;
  loading: boolean;
  error: string | null;
}

// 2. Initial state
const initialState: DashboardState = {
  applications: null,
  jobPosts: null,
  loading: false,
  error: null,
};

// 3. Async thunks
export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async () => {
    const [applications, jobPosts] = await Promise.all([
      dashboardService.applicationStats(),
      dashboardService.jobPostStats(),
    ]);
    return { applications, jobPosts };
  },
);

// 4. Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,

  // 5. Synchronous reducers
  reducers: {},

  // 6. Async reducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.applications;
        state.jobPosts = action.payload.jobPosts;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load dashboard";
      });
  },
});

// 8. Reducer export
export default dashboardSlice.reducer;
