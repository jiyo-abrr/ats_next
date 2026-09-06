import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";

import * as jobPostsService from "@/features/job-posts/jobPostsService";
import type { JobPost } from "@/features/job-posts/schema";

// 1. State type
interface JobPostsState {
  list: JobPost[];
  listTotal: number;
  listPages: number;
  listLoading: boolean;
  listError: string | null;
  byId: Record<string, JobPost>;
  detailLoading: boolean;
  detailError: string | null;
  saving: boolean;
}

// 2. Initial state
const initialState: JobPostsState = {
  list: [],
  listTotal: 0,
  listPages: 0,
  listLoading: false,
  listError: null,
  byId: {},
  detailLoading: false,
  detailError: null,
  saving: false,
};

// 3. Async thunks
export const fetchJobPosts = createAsyncThunk(
  "jobPosts/fetchJobPosts",
  async (qs: string) => jobPostsService.getAll(qs),
);
export const fetchJobPost = createAsyncThunk(
  "jobPosts/fetchJobPost",
  async (id: string) => jobPostsService.getById(id),
);
export const createJobPost = createAsyncThunk(
  "jobPosts/createJobPost",
  async (body: Record<string, unknown>) => jobPostsService.create(body),
);
export const updateJobPost = createAsyncThunk(
  "jobPosts/updateJobPost",
  async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
    jobPostsService.update(id, body),
);
export const deleteJobPost = createAsyncThunk(
  "jobPosts/deleteJobPost",
  async (id: string) => jobPostsService.remove(id),
);

// relationship mutations — all resolve to the refreshed JobPost
export const addJobPostTag = createAsyncThunk(
  "jobPosts/addTag",
  async ({ id, tagId }: { id: string; tagId: string }) =>
    jobPostsService.addTag(id, tagId),
);
export const removeJobPostTag = createAsyncThunk(
  "jobPosts/removeTag",
  async ({ id, tagId }: { id: string; tagId: string }) =>
    jobPostsService.removeTag(id, tagId),
);
export const addJobPostExclusion = createAsyncThunk(
  "jobPosts/addExclusion",
  async ({ id, excludedId }: { id: string; excludedId: string }) =>
    jobPostsService.addExclusion(id, excludedId),
);
export const removeJobPostExclusion = createAsyncThunk(
  "jobPosts/removeExclusion",
  async ({ id, excludedId }: { id: string; excludedId: string }) =>
    jobPostsService.removeExclusion(id, excludedId),
);
export const setJobPostTemplate = createAsyncThunk(
  "jobPosts/setTemplate",
  async ({
    id,
    kind,
    templateId,
  }: {
    id: string;
    kind: string;
    templateId: string;
  }) => jobPostsService.setTemplate(id, kind, templateId),
);
export const removeJobPostTemplate = createAsyncThunk(
  "jobPosts/removeTemplate",
  async ({
    id,
    kind,
    templateId,
  }: {
    id: string;
    kind: string;
    templateId: string;
  }) => jobPostsService.removeTemplate(id, kind, templateId),
);

// 4. Slice
const jobPostsSlice = createSlice({
  name: "jobPosts",
  initialState,

  // 5. Synchronous reducers
  reducers: {},

  // 6. Async reducers
  extraReducers: (builder) => {
    const writes = [
      createJobPost,
      updateJobPost,
      addJobPostTag,
      removeJobPostTag,
      addJobPostExclusion,
      removeJobPostExclusion,
      setJobPostTemplate,
      removeJobPostTemplate,
    ] as const;

    builder
      .addCase(fetchJobPosts.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchJobPosts.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.items;
        state.listTotal = action.payload.total;
        state.listPages = action.payload.pages;
      })
      .addCase(fetchJobPosts.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.error.message ?? "Failed to load job posts";
      })
      .addCase(fetchJobPost.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchJobPost.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.byId[action.payload.id] = action.payload;
      })
      .addCase(fetchJobPost.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.error.message ?? "Failed to load job post";
      })
      .addMatcher(isAnyOf(...writes.map((t) => t.pending)), (state) => {
        state.saving = true;
      })
      .addMatcher(
        isAnyOf(...writes.map((t) => t.fulfilled)),
        (state, action) => {
          state.saving = false;
          const job = action.payload as JobPost;
          state.byId[job.id] = job;
        },
      )
      .addMatcher(isAnyOf(...writes.map((t) => t.rejected)), (state) => {
        state.saving = false;
      });
  },
});

// 8. Reducer export
export default jobPostsSlice.reducer;
