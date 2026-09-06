import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";

import * as templatesService from "@/features/templates/templatesService";
import type {
  AssessmentTemplate,
  TemplateKind,
} from "@/features/templates/schema";

// 1. State type
interface TemplatesState {
  /** All three kinds, unpaginated — only the job-post form's pickers read this. */
  byKind: Record<TemplateKind, AssessmentTemplate[]>;
  byId: Record<string, AssessmentTemplate>;
  /** The current paginated per-kind page (`/ats/templates/<kind>`). */
  list: AssessmentTemplate[];
  listKind: TemplateKind | null;
  listTotal: number;
  listPages: number;
  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  error: string | null;
}

// 2. Initial state
const initialState: TemplatesState = {
  byKind: {
    "pre-assessment": [],
    "culture-fit": [],
    "technical-assessment": [],
  },
  byId: {},
  list: [],
  listKind: null,
  listTotal: 0,
  listPages: 0,
  loading: false,
  detailLoading: false,
  saving: false,
  error: null,
};

// 3. Async thunks
/** All three kinds for the job-post form pickers — a generous first page each. */
export const fetchTemplates = createAsyncThunk(
  "templates/fetchTemplates",
  async () => {
    const [pre, culture, technical] = await Promise.all([
      templatesService.list("pre-assessment", "size=100"),
      templatesService.list("culture-fit", "size=100"),
      templatesService.list("technical-assessment", "size=100"),
    ]);
    return {
      pre: pre.items,
      culture: culture.items,
      technical: technical.items,
    };
  },
);

/** One kind, one page — the per-kind templates page. */
export const fetchTemplatesByKind = createAsyncThunk(
  "templates/fetchTemplatesByKind",
  async ({ kind, qs }: { kind: TemplateKind; qs: string }) => {
    const page = await templatesService.list(kind, qs);
    return { kind, page };
  },
);

export const fetchTemplate = createAsyncThunk(
  "templates/fetchTemplate",
  async ({ kind, id }: { kind: TemplateKind; id: string }) =>
    templatesService.get(kind, id),
);

export const createTemplate = createAsyncThunk(
  "templates/createTemplate",
  async ({
    kind,
    body,
  }: {
    kind: TemplateKind;
    body: Record<string, unknown>;
  }) => templatesService.create(kind, body),
);

export const updateTemplate = createAsyncThunk(
  "templates/updateTemplate",
  async ({
    kind,
    id,
    body,
  }: {
    kind: TemplateKind;
    id: string;
    body: Record<string, unknown>;
  }) => templatesService.update(kind, id, body),
);

export const deleteTemplate = createAsyncThunk(
  "templates/deleteTemplate",
  async ({ kind, id }: { kind: TemplateKind; id: string }) => {
    await templatesService.remove(kind, id);
    return id;
  },
);

export const addTemplateQuestion = createAsyncThunk(
  "templates/addQuestion",
  async ({
    kind,
    id,
    body,
  }: {
    kind: TemplateKind;
    id: string;
    body: Record<string, unknown>;
  }) => templatesService.addQuestion(kind, id, body),
);

// 4. Slice
const templatesSlice = createSlice({
  name: "templates",
  initialState,

  // 5. Synchronous reducers
  reducers: {},

  // 6. Async reducers
  extraReducers: (builder) => {
    const writes = [
      createTemplate,
      updateTemplate,
      addTemplateQuestion,
    ] as const;

    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.byKind["pre-assessment"] = action.payload.pre;
        state.byKind["culture-fit"] = action.payload.culture;
        state.byKind["technical-assessment"] = action.payload.technical;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load templates";
      })
      .addCase(fetchTemplatesByKind.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplatesByKind.fulfilled, (state, action) => {
        state.loading = false;
        state.listKind = action.payload.kind;
        state.list = action.payload.page.items;
        state.listTotal = action.payload.page.total;
        state.listPages = action.payload.page.pages;
      })
      .addCase(fetchTemplatesByKind.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load templates";
      })
      .addCase(fetchTemplate.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.byId[action.payload.id] = action.payload;
      })
      .addCase(fetchTemplate.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.error.message ?? "Failed to load template";
      })
      .addMatcher(isAnyOf(...writes.map((t) => t.pending)), (state) => {
        state.saving = true;
      })
      .addMatcher(isAnyOf(...writes.map((t) => t.fulfilled)), (state, action) => {
        state.saving = false;
        const tpl = action.payload as AssessmentTemplate;
        state.byId[tpl.id] = tpl;
      })
      .addMatcher(isAnyOf(...writes.map((t) => t.rejected)), (state) => {
        state.saving = false;
      });
  },
});

// 8. Reducer export
export default templatesSlice.reducer;
