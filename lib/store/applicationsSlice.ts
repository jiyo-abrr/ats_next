import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as applicationsService from "@/features/applications/applicationsService";
import type {
  Application,
  ApplicationAssessments,
  ApplicationReview,
  ApplicationSummary,
} from "@/features/applications/schema";

// 1. State type
interface ApplicationsState {
  mine: ApplicationSummary[];
  mineTotal: number;
  minePages: number;
  mineLoading: boolean;
  mineError: string | null;

  review: ApplicationReview[];
  reviewTotal: number;
  reviewPages: number;
  reviewLoading: boolean;
  reviewError: string | null;

  current: Application | null;
  currentLoading: boolean;
  currentError: string | null;

  assessments: ApplicationAssessments | null;
  assessmentsLoading: boolean;

  acting: boolean;
}

// 2. Initial state
const initialState: ApplicationsState = {
  mine: [],
  mineTotal: 0,
  minePages: 0,
  mineLoading: false,
  mineError: null,
  review: [],
  reviewTotal: 0,
  reviewPages: 0,
  reviewLoading: false,
  reviewError: null,
  current: null,
  currentLoading: false,
  currentError: null,
  assessments: null,
  assessmentsLoading: false,
  acting: false,
};

// 3. Async thunks
export const fetchMyApplications = createAsyncThunk(
  "applications/fetchMine",
  async (qs: string) => applicationsService.listMine(qs),
);
export const fetchApplication = createAsyncThunk(
  "applications/fetchOne",
  async (id: string) => applicationsService.get(id),
);
export const fetchApplicationAssessments = createAsyncThunk(
  "applications/fetchAssessments",
  async (id: string) => applicationsService.getAssessments(id),
);
export const submitApplication = createAsyncThunk(
  "applications/submit",
  async (jobPostId: string) => applicationsService.create(jobPostId),
);
export const withdrawApplication = createAsyncThunk(
  "applications/withdraw",
  async (id: string) => applicationsService.withdraw(id),
);
export const fetchApplicationsForReview = createAsyncThunk(
  "applications/fetchReview",
  async (qs: string) => applicationsService.listForReview(qs),
);
export const changeApplicationStatus = createAsyncThunk(
  "applications/changeStatus",
  async ({ id, status }: { id: string; status: string }) =>
    applicationsService.updateStatus(id, status),
);
export const extendAssessmentDeadline = createAsyncThunk(
  "applications/extendDeadline",
  async ({
    id,
    body,
  }: {
    id: string;
    body: { reason: string; new_deadline?: string; extend_by_days?: number };
  }) => applicationsService.extendDeadline(id, body),
);
export const reopenAssessmentAttempt = createAsyncThunk(
  "applications/reopenAttempt",
  async ({
    attemptId,
    reason,
  }: {
    attemptId: string;
    reason: string;
    applicationId: string;
  }) => applicationsService.reopenAttempt(attemptId, reason),
);

// 4. Slice
const applicationsSlice = createSlice({
  name: "applications",
  initialState,

  // 5. Synchronous reducers
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
      state.assessments = null;
    },
  },

  // 6. Async reducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.mineLoading = true;
        state.mineError = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.mineLoading = false;
        state.mine = action.payload.items;
        state.mineTotal = action.payload.total;
        state.minePages = action.payload.pages;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.mineLoading = false;
        state.mineError = action.error.message ?? "Failed to load applications";
      })
      .addCase(fetchApplication.pending, (state) => {
        state.currentLoading = true;
        state.currentError = null;
      })
      .addCase(fetchApplication.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchApplication.rejected, (state, action) => {
        state.currentLoading = false;
        state.currentError = action.error.message ?? "Failed to load application";
      })
      .addCase(fetchApplicationAssessments.pending, (state) => {
        state.assessmentsLoading = true;
      })
      .addCase(fetchApplicationAssessments.fulfilled, (state, action) => {
        state.assessmentsLoading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchApplicationAssessments.rejected, (state) => {
        state.assessmentsLoading = false;
      })
      .addCase(fetchApplicationsForReview.pending, (state) => {
        state.reviewLoading = true;
        state.reviewError = null;
      })
      .addCase(fetchApplicationsForReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.review = action.payload.items;
        state.reviewTotal = action.payload.total;
        state.reviewPages = action.payload.pages;
      })
      .addCase(fetchApplicationsForReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.reviewError = action.error.message ?? "Failed to load applications";
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(changeApplicationStatus.pending, (state) => {
        state.acting = true;
      })
      .addCase(changeApplicationStatus.fulfilled, (state, action) => {
        state.acting = false;
        state.current = action.payload;
      })
      .addCase(changeApplicationStatus.rejected, (state) => {
        state.acting = false;
      })
      .addCase(extendAssessmentDeadline.pending, (state) => {
        state.acting = true;
      })
      .addCase(extendAssessmentDeadline.fulfilled, (state, action) => {
        state.acting = false;
        state.current = action.payload;
      })
      .addCase(extendAssessmentDeadline.rejected, (state) => {
        state.acting = false;
      });
  },
});

// 7. Action exports
export const { clearCurrent } = applicationsSlice.actions;

// 8. Reducer export
export default applicationsSlice.reducer;
