import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as assessmentsService from "@/features/assessments/assessmentsService";
import type { AttemptDetail } from "@/features/assessments/schema";

// 1. State type
interface AssessmentsState {
  attempt: AttemptDetail | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

// 2. Initial state
const initialState: AssessmentsState = {
  attempt: null,
  loading: false,
  error: null,
  submitting: false,
};

// 3. Async thunks
export const fetchAttempt = createAsyncThunk(
  "assessments/fetchAttempt",
  async (id: string) => assessmentsService.getAttempt(id),
);

export const startQuestion = createAsyncThunk(
  "assessments/startQuestion",
  async ({ attemptId, questionId }: { attemptId: string; questionId: string }) =>
    assessmentsService.startQuestion(attemptId, questionId),
);

export const submitAnswer = createAsyncThunk(
  "assessments/submitAnswer",
  async ({
    attemptId,
    questionId,
    answerValue,
  }: {
    attemptId: string;
    questionId: string;
    answerValue: unknown;
    applicationId: string;
  }) => assessmentsService.submitAnswer(attemptId, questionId, answerValue),
);

// 4. Slice
const assessmentsSlice = createSlice({
  name: "assessments",
  initialState,

  // 5. Synchronous reducers
  reducers: {
    clearAttempt: (state) => {
      state.attempt = null;
      state.error = null;
    },
  },

  // 6. Async reducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.attempt = action.payload;
      })
      .addCase(fetchAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load assessment";
      })
      .addCase(submitAnswer.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitAnswer.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitAnswer.rejected, (state) => {
        state.submitting = false;
      });
  },
});

// 7. Action exports
export const { clearAttempt } = assessmentsSlice.actions;

// 8. Reducer export
export default assessmentsSlice.reducer;
