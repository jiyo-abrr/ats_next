# ATS Frontend — Implementation Plan

> **Phases 0 → 5 complete & verified.** Phase 5 (clean-architecture restructure — `ui/` mirrors
> `app/`, real Suspense fallbacks) landed as a pure move/import pass, no behaviour change.
> See **Status** at the bottom.

## Context

`rd/ats_fastapi` is a fully-built Applicant Tracking System API (domain-based FastAPI, JWT auth,
RBAC, job posts, applications with an 8-state hiring pipeline, and a 3-type assessment system).
`rd/ats_next` is the Next.js 16.3.4 / React 19 / Tailwind v4 frontend.

Two surfaces, one Next.js app, two route groups:

| Surface | Route group | Audience | Purpose |
|---|---|---|---|
| **fmc-ats** | `app/(ats)` | HR + admin | Manage job posts, review applications, run the hiring pipeline, author assessment templates, manage RBAC/HR accounts |
| **fmc-careers** | `app/(careers)` | Applicants | Browse/search published jobs, apply (with résumé), track applications, take assessments |

Locked-in decisions: **BFF auth** (Next route handlers proxy to FastAPI server-side, tokens in
httpOnly cookies, auto-refresh on 401); **phased delivery** with checkpoints; **Redux Toolkit
classic slices** (`createSlice` + `createAsyncThunk` + a per-feature `<feature>Service.ts`) — *not* RTK
Query — for a uniform, readable data layer; shadcn/ui, Tailwind v4, zod + react-hook-form, sonner;
**feature-slice** file structure (below); no `src/` dir.

> **Trade-off accepted:** classic thunks give every feature an identical, teachable shape but no
> automatic caching/dedup/background-refetch. Mitigation: the feature hook re-dispatches `fetch…`
> when its params (from the URL) change, and after a mutation thunk fulfils. This is fine for an
> internal ATS — a stale re-fetch on remount is cheap.

### Progress so far

- **Phase 0 ✅** — BFF proxy + auth route handlers, httpOnly cookies + silent refresh, `proxy.ts`
  optimistic guard, ATS server-side role guard, Redux store, shadcn (radix-nova style),
  careers + ATS layout shells, login/signup(+résumé)/logout. Verified end-to-end.
  *(Built on RTK Query — replaced with classic slices in Phase 2.5.)*
- **Phase 1 ✅** — shared component kit, URL-backed table state, positions/tags/company-addresses CRUD.
- **Phase 2 ✅** — careers: job browse/detail/apply, my-applications, application detail
  (deadline countdown, withdraw, assessment panel), sequential assessment runner, profile.
  **Backend addition:** `GET /assessment-attempts/{id}` (owner-gated, pure read, current question
  only) + 4 unit tests (110 pass).
- **Phase 2.5 ✅** — backend B1–B5 (`+15` unit tests, 125 pass, ruff clean, all runtime-verified);
  frontend swapped RTK Query → classic thunk slices; restructured into `features/<domain>/` +
  `lib/store/*Slice.ts` (all slices in `lib/store/`) + `components/{data-table,form,*}` +
  `lib/{api,hooks,utils}/`; deleted the transition/withdrawable maps (read B1 off the API).
- **Phase 3 ✅** — ATS core: dashboard (B3 stats), job-posts list/create/detail-with-tabs
  (Details / Tags / Exclusions / Assessments via dedicated endpoints), applications review list +
  pipeline detail (`allowed_status_transitions` buttons, extend-deadline, résumé download B5,
  reopen expired attempts). `AsyncCombobox`. Build + eslint clean; flows runtime-verified.
- **Phase 4 ✅** — assessment-template CRUD + append-question authoring (dynamic config per type);
  RBAC role×permission matrix (grant/revoke) + create-HR-account form (admin-only page). README.
  Build + eslint clean; templates / rbac / hr-account flows runtime-verified. **All phases done.**

---

## Frontend ↔ backend responsibility split (governing principle)

**The frontend requests and renders. The backend computes.**

| Stays on the frontend | Moves to / stays on the backend |
|---|---|
| Date / number / currency formatting (`lib/utils/format.ts`) | Any **business rule** that also lives in a service class |
| Enum → label / badge-tone lookup (`lib/constants.ts`) | **Aggregates / tallies** (dashboard counts, funnel numbers) |
| Building query strings from URL state (`lib/utils/query.ts`) | "What can I do next" — allowed status transitions, `can_withdraw` |
| Disabling a submit button pre-flight (non-authoritative) | "Do I already have an application for this job" |
| Layout, copy, empty/error/loading states | Assessment progress (`answered_count` / `total_questions`) |

Rule of thumb: if a component would have to encode a rule the API knows, add a field to the API
response instead. `lib/constants.ts` keeps only **display** maps (labels, tones) — never transition
graphs or capability sets.

---

## Backend additions required — do these first in Phase 2.5

Each follows the existing domain conventions (entities → schemas → repository → service → router;
services raise domain errors; list projections stay projections). All get unit tests; `ruff` +
`pytest` stay green; `ats_fastapi/CLAUDE.md` updated.

| # | Change | Where | Replaces on frontend |
|---|---|---|---|
| **B1** | `ApplicationOut` + `ApplicationReviewOut` gain `allowed_status_transitions: list[str]` (from `_ALLOWED_TRANSITIONS[status]`, `[]` when terminal) and `can_withdraw: bool` (status ∈ applied/prescreening/interview). Pure functions of `status`. | expose a `_ALLOWED_TRANSITIONS`/`_WITHDRAWABLE_STATUSES` helper on `ApplicationService`; `applications/schemas.py`; `applications/router.py` fills the projection fields. | `APPLICATION_TRANSITIONS` + `WITHDRAWABLE_STATUSES` maps in `lib/constants.ts` (delete) |
| **B2** | `AssessmentAttemptOut` gains `answered_count: int` + `total_questions: int`. `AssessmentService.list_for_application()` resolves each attempt's template question count via `_get_template`. | `assessments/attempts/schemas.py`, `.../service.py`; `applications/router.py` (`get_application_assessments`). | `attemptProgress()` in the assessment panel |
| **B3** | `GET /applications/stats` (perm `manage_applications`, optional `?job_post_id=`) → `{ by_status: {<status>: n}, total }`. `GET /job-posts/stats` (perm `manage_jobs`) → `{ by_status: {draft,published,closed}, total }`. One `GROUP BY status` query each. | new `stats` route + repo method in `applications/` and `job_posts/`. | ATS dashboard N× `size=1` list calls + client summation |
| **B4** | `GET /applications/me` accepts optional `?job_post_id=`. | `applications/router.py` + `ApplicationRepository.list_for_applicant(applicant_id, job_post_id=None)`. | `apply-button.tsx` pulling `size=100` and scanning |
| **B5** | `GET /applications/{id}/resume` — streams the MinIO object (owner **or** `manage_applications`), `Content-Disposition: attachment`. | `get_object` helper in `app/core/storage.py` + `ApplicationService` method reusing `get()`'s ownership check + route. | "résumé download not available" placeholder |

Deferred (note as limitations): querybuilder search/sort on `GET /applications`; template question
edit/delete/reorder; a real applicant directory.

---

## Architecture — clean layers, feature slices, `ui/` mirrors `app/`

**Four layers, dependencies point inward** (`app` is the outermost delivery mechanism, `lib`
the innermost framework/infra):

```
app/            →  features/<domain>/ui/  →  features/<domain>/hooks  →  lib/store/<domain>Slice
                                                                      →  features/<domain>/<domain>Service
                                                                      →  lib/api/client
```

| Layer | Folder | Rule |
|---|---|---|
| **Delivery** | `app/` | routing only. Every `page.tsx`: `await params` → `<Suspense fallback={<Skeleton/>}>` → render one `*-view` from `features/`. Server Components only do the auth/role guard. |
| **Feature (domain slice)** | `features/<domain>/` | ONE folder per domain (a domain used on both surfaces has **one** service/schema/hooks). `<domain>Service.ts` is the only file that touches `apiClient`; `schema.ts` is the domain model (zod + response types); `hooks.ts` is the application layer (`use<Domain>()` = select + dispatch, the view's sole entry). Presentation lives in `ui/`, split by the route surface it serves. |
| **Design system** | `components/` | cross-domain, surface-agnostic UI. Never imports `features/`. |
| **Framework / infra** | `lib/` | `api/`, `hooks/redux`, `utils/`, `middleware/`, `auth/` (server), `server/`, `config`/`types`/`constants`/`cn`/`providers`. A leaf — **except `lib/store/`**, the composition root, which holds every slice and imports `features/<domain>/{Service,schema}`. |

```
proxy.ts                              # Next 16 "proxy" — optimistic cookie guard
app/                                  # DELIVERY — routing only
  layout.tsx
  (careers)/                          #   jobs, jobs/[id], login, signup, profile,
                                      #   applications, applications/[id],
                                      #   applications/[id]/assessments/[attemptId]
  (ats)/                              #   ats (dashboard), ats/job-posts(+new,+[id]),
                                      #   ats/applications(+[id]), ats/positions|tags|
                                      #   company-addresses, ats/templates(+[kind]/[id]), ats/rbac
  api/  auth/(login|signup|logout)/route.ts   ·   bff/[...path]/route.ts
  → every page.tsx: `<Suspense fallback={<TableSkeleton/> | <FormSkeleton/> | …}>` + one view

features/<domain>/                    # FEATURE — one per domain (shared across surfaces)
  <domain>Service.ts                  #   gateway — the only file that calls apiClient
  schema.ts                           #   domain model: zod schemas + response interfaces + z.infer types
  hooks.ts                            #   application layer: use<Domain>() → select + dispatch; the view's entry
  ui/
    careers/                          #   presentation for the (careers) routes
    ats/                              #   presentation for the (ats) routes
    shared/                           #   components used by BOTH surfaces (rare)
    _parts/                           #   private sub-components of one view (was `_components/`)

  # per domain — surface(s) it serves, and its ui/ contents:
  auth/            → ui/careers/{login-form, signup-form}
  profile/         → ui/careers/{profile-view}
  assessments/     → ui/careers/{assessment-panel, attempt-runner-view, answer-input}
  positions/       → ui/ats/{positions-view, positions-columns, position-form}
  tags/            → ui/ats/{…}          company-addresses/ → ui/ats/{…}
  templates/       → ui/ats/{template-kind-view (/[kind]), template-detail-view, template-form,
                              _parts/{question-form, questions-list}}
  rbac/            → ui/ats/{rbac-view, role-permission-matrix, create-hr-account-form}
  dashboard/       → ui/ats/{dashboard-view}
  job-posts/       → ui/careers/{job-list-view, job-detail-view, job-card, apply-button}
                     ui/ats/{job-posts-view, job-posts-columns, job-post-create-view,
                             job-post-applicants-view (/[id]), job-post-edit-view (/[id]/edit),
                             job-post-form, use-form-options,
                             _parts/{details, tags, exclusions, templates, applicants}-panel}
  applications/    → ui/careers/{my-applications-view, my-applications-columns,
                                 application-detail-view}
                     ui/ats/{review-view, review-columns, application-review-detail-view,
                             _parts/{pipeline-stepper, status-actions, extend-deadline-dialog,
                                     resume-download-button, review-assessments}}

components/                           # DESIGN SYSTEM — cross-domain, surface-agnostic
  ui/*                                # shadcn atoms (vendored, untouched)
  data-table/
    data-table.tsx  pagination.tsx  toolbar.tsx  sort-header.tsx  filter-select.tsx  search-input.tsx
  form/
    fields.tsx  entity-form-sheet.tsx
  page-header.tsx  breadcrumbs.tsx  status-badge.tsx  stat-card.tsx  countdown.tsx
  confirm-dialog.tsx  row-actions.tsx  empty-state.tsx  error-state.tsx  table-skeleton.tsx
  coming-soon.tsx  logo.tsx  user-menu.tsx
  layout/
    site-header.tsx  ats-shell.tsx

lib/                                  # framework/util — leaf EXCEPT lib/store/ (composition root)
  config.ts                           # env, cookie names, ATS_ROLES, APP_NAME
  types.ts                            # Role, User, Paginated<T>, enum string-literal unions
  constants.ts                        # display maps only (label + badge-tone per enum value)
  cn.ts                               # `export { cn } from "cn"` — shadcn `utils` alias → @/lib/cn
  providers.tsx                       # <Provider store> + ThemeProvider + <Toaster> + auth bootstrap
  api/
    client.ts                         # apiClient<T>() + ApiError + apiBlob — fetch wrapper for /api/bff/*
  hooks/
    redux.ts                          # typed useAppDispatch / useAppSelector / useAppStore ONLY
    use-table-query.ts                # URL ⇄ table state (page/size/sort/filter/search)
    use-resource-crud.ts              # generic create/edit-sheet + delete-confirm orchestration
  utils/
    format.ts                         # date / money / name / salary formatters
    query.ts                          # TableQuery ⇄ fastapi-pagination + querybuilder params
    toast.ts                          # thin sonner wrapper
  middleware/
    toast-error.ts                    # toasts any `…/rejected` thunk unless meta.arg.silent
  auth/cookies.ts                     # server-only — httpOnly cookie read/write
  server/api.ts                       # server-only — Server Component fetch + role guard helper
  store/                              # composition root — holds every slice, may import features/
    store.ts                          #   configureStore + RootState / AppDispatch / AppStore
                                      #   (imported as `@/lib/store/store`)
    authSlice.ts                      #   8-section template; imports `@/features/auth/{authService,schema}`
    positionsSlice.ts  tagsSlice.ts  companyAddressesSlice.ts
    jobPostsSlice.ts  applicationsSlice.ts  assessmentsSlice.ts  dashboardSlice.ts
```

**Dependency direction:** `lib/store/store.ts → lib/store/*Slice.ts → features/<domain>/{<domain>Service,schema}`.
A feature's `hooks.ts` imports thunks/actions from `@/lib/store/<domain>Slice` and `RootState` (type)
from `@/lib/store/store`. No runtime cycle. The rest of `lib/` stays a true leaf.

### What goes where — the split that keeps `lib/` a leaf

- **`lib/types.ts`** — only framework-agnostic shared types: `Paginated<T>`, `ApiErrorShape`,
  and the enum **string-literal unions** (`ApplicationStatus`, `JobPostStatus`, `EmploymentType`,
  `AttemptStatus`, `TemplateType`, `QuestionType`, `Role`). No response interfaces.
- **`features/<domain>/schema.ts`** — that domain's zod form schemas **and** its response
  interfaces (`JobPost`, `Application`, …). Cross-feature reads import from here directly
  (`features/job-posts/schema` from the applications feature) — features may depend on features.
- **`lib/constants.ts`** — display maps only (`APPLICATION_STATUS` label+tone, `EMPLOYMENT_TYPE_LABELS`,
  …), keyed by the enum unions from `lib/types.ts`. No transition graph, no capability set.
- **`features/auth/hooks.ts`** — `useCurrentUser` / `useAuthResolved` (were in `lib/hooks/redux.ts`);
  `lib/hooks/redux.ts` keeps only the generic typed `useAppDispatch` / `useAppSelector`.

### Slice anatomy — one `lib/store/<domain>Slice.ts` file, this exact 8-section order

```ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as positionsService from "@/features/positions/positionsService";
import type { Position, PositionInput } from "@/features/positions/schema";

// 1. State type
interface PositionsState {
  data: Position[];
  total: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// 2. Initial state
const initialState: PositionsState = {
  data: [], total: 0, loading: false, saving: false, error: null,
};

// 3. Async thunks
export const fetchPositions = createAsyncThunk(
  "positions/fetchPositions",
  async (params: ListParams) => positionsService.getAll(params),
);
export const createPosition = createAsyncThunk(
  "positions/createPosition",
  async (body: PositionInput) => positionsService.create(body),
);
// updatePosition, deletePosition …

// 4. Slice
const positionsSlice = createSlice({
  name: "positions",
  initialState,

  // 5. Synchronous reducers
  reducers: {
    clearError: (state) => { state.error = null; },
  },

  // 6. Async reducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load positions";
      })
      .addCase(createPosition.pending, (state) => { state.saving = true; })
      .addCase(createPosition.fulfilled, (state) => { state.saving = false; })
      .addCase(createPosition.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? "Failed to save";
      });
  },
});

// 7. Action exports
export const { clearError } = positionsSlice.actions;

// 8. Reducer export
export default positionsSlice.reducer;
```

- **Thunks throw, they don't `rejectWithValue`** — `apiClient` throws `ApiError` whose `.message`
  is the FastAPI `detail`, so `action.error.message` already carries it (matches the example).
- **`features/<domain>/<domain>Service.ts`** is the paired API module (stays in the feature folder):
  one thin async fn per endpoint calling `apiClient<T>('<bff path>', init?)`. No Redux, no React.
- `reducers` (section 5) holds sync UI state only (`clearError`, `resetForm`). All list
  pagination/sort/filter lives in the **URL** via `useTableQuery`, never in the slice.
- Cross-slice reset on logout: `extraReducers` adds
  `.addCase(logout.fulfilled, () => initialState)` (import the `logout` thunk from `@/lib/store/authSlice`).
- **Selectors** are small and inline where used (`useAppSelector((s) => s.positions)`); a feature
  that needs a derived one puts a `createSelector` in `hooks.ts`, not a separate file.
- **Views fetch via a colocated hook** (`features/positions/hooks.ts` → `usePositions()`):
  reads `useTableQuery()`, `useEffect(() => { dispatch(fetchPositions(params)); }, [params])`,
  returns `{ data, total, loading, error }`. `positions-view.tsx` is then ~40 lines of layout.
- **List slices are written out in full** following this template (positions/tags/company-addresses
  are near-identical ~70-line files — accepted: explicit > a factory that hides the 8 sections).

### Worked example — `positions`

```
lib/store/positionsSlice.ts   # the 8-section slice (thunks call features/positions/positionsService)
features/positions/
  positionsService.ts         # thin async fns → apiClient(...)
  schema.ts                   # positionSchema (zod) + Position / PositionInput types
  hooks.ts                    # usePositions() — the only fetch plumbing a view touches
  positions-view.tsx          # ~40 lines of layout, no useEffect
  positions-columns.tsx       # ColumnDef[] (header + cell renderers)
  position-form.tsx           # RHF <Field> set for <EntityFormSheet>
```

```ts
// features/positions/positionsService.ts
import { apiClient } from "@/lib/api/client";
import type { Paginated } from "@/lib/types";
import type { Position } from "./schema";

export const getAll = (qs: string)                          => apiClient<Paginated<Position>>(qs ? `positions?${qs}` : "positions");
export const create = (body: Record<string, unknown>)       => apiClient<Position>("positions", { method: "POST", body: JSON.stringify(body) });
export const update = (id: string, body: Record<string, unknown>) => apiClient<Position>(`positions/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const remove = (id: string)                          => apiClient<void>(`positions/${id}`, { method: "DELETE" });
```

```ts
// features/positions/hooks.ts
import { fetchPositions } from "@/lib/store/positionsSlice";

export function usePositions() {
  const dispatch = useAppDispatch();
  const table = useTableQuery();
  const qs = buildBackendParams(table.query).toString();
  const state = useAppSelector((s) => s.positions);
  useEffect(() => { dispatch(fetchPositions(qs)); }, [dispatch, qs]);
  return { ...state, ...table };  // { data, total, pages, loading, saving, error, query, setPage, … }
}
```

The bespoke slices (`auth`, `applications`, `assessments`, `dashboard`) use the same 8-section
template; only their internals differ (detail state shape, extra thunks).

### Naming

- Slice files: `lib/store/<domain>Slice.ts` (camelCase). `<domain>Slice` is also the `createSlice`
  variable name. Service files: `features/<domain>/<domain>Service.ts`.
- `schema.ts` / `hooks.ts` bare; component files kebab-case + feature-prefixed (`positions-view.tsx`).
- One feature folder per backend domain; components PascalCase.
- Careers "jobs" pages live in `features/job-posts/` (same domain); the URL stays `/jobs`.

### Phase 2.5 restructure map

| Now (RTK Query) | → (classic slice) |
|---|---|
| `lib/api/baseApi.ts` (`createApi` + `fetchBaseQuery` + `baseQueryWithFeedback`) | `lib/api/client.ts` (`apiClient` fetch wrapper) + `lib/middleware/toast-error.ts` |
| `lib/api/endpoints/auth.ts` (`useLoginMutation`, …) | `features/auth/authService.ts` + `lib/store/authSlice.ts` (`login`/`signup`/`logout`/`fetchMe` thunks) |
| `lib/api/endpoints/refData.ts` | split → `features/{positions,tags,company-addresses}/<x>Service.ts` + `lib/store/<x>Slice.ts` |
| `lib/api/endpoints/jobs.ts` | `features/job-posts/jobPostsService.ts` + `lib/store/jobPostsSlice.ts` |
| `lib/api/endpoints/applications.ts` | `features/applications/applicationsService.ts` + `lib/store/applicationsSlice.ts` |
| `lib/api/endpoints/attempts.ts` | `features/assessments/assessmentsService.ts` + `lib/store/assessmentsSlice.ts` |
| `lib/schemas/auth.ts` | `features/auth/schema.ts` |
| `lib/schemas/refData.ts` | split → `features/{positions,tags,company-addresses}/schema.ts` |
| `lib/slices/authSlice.ts` (matcher-based) | `lib/store/authSlice.ts` (8-section template, thunk-based) |
| `lib/hooks.ts` `useCurrentUser` / `useAuthResolved` | `features/auth/hooks.ts` (`lib/hooks.ts` → `lib/hooks/redux.ts`, generic only) |
| response interfaces in `lib/types.ts` (JobPost, Application, …) | the owning `features/<x>/schema.ts` |
| `lib/store.ts` (`baseApi.reducer` + `baseApi.middleware`) | `lib/store/store.ts` — `configureStore({ reducer: { positions, tags, … } })` + `toastError` middleware; all `*Slice.ts` alongside it |
| every component `useXQuery()` / `useXMutation()` | `useAppSelector(selectX)` + `dispatch(thunk())`, wrapped in a feature hook (`usePositionsList()` etc.) |
| `components/positions/PositionsManager.tsx` | `features/positions/positions-view.tsx` + `positions-columns.tsx` + `position-form.tsx` + `hooks.ts` |
| `components/tags/TagsManager.tsx`, `company-addresses/*` | same pattern under `features/{tags,company-addresses}/` |
| `components/jobs/{JobsBrowse,JobDetail,JobCard,ApplyButton}.tsx` | `features/job-posts/{job-list-view,job-detail-view,job-card,apply-button}.tsx` (`salaryLabel` → `lib/utils/format.ts`) |
| `components/applications/{MyApplicationsTable,ApplicationDetail}.tsx` | `features/applications/{my-applications-view,my-applications-columns,application-detail-view}.tsx` |
| `components/assessments/{AssessmentPanel,AttemptRunner,AnswerInput}.tsx` | `features/assessments/{assessment-panel,attempt-runner-view,answer-input}.tsx` |
| `components/profile/ProfileCard.tsx` | `features/profile/profile-view.tsx` |
| `components/auth/{LoginForm,SignupForm}.tsx` | `features/auth/{login-form,signup-form}.tsx` |
| `components/common/DataTable*.tsx`, `SearchInput`, `FilterSelect`, `DataTableToolbar` | `components/data-table/*` (kebab-case) |
| `components/common/form/fields.tsx`, `EntityFormSheet.tsx` | `components/form/*` |
| `components/common/{PageHeader,Breadcrumbs,StatusBadge,StatCard,Countdown,ConfirmDialog,RowActions,states,TableSkeleton,ComingSoon,Logo,UserMenu}.tsx` | `components/*.tsx` (flat, kebab-case) |
| `components/layout/{SiteHeader,AtsShell}.tsx` | `components/layout/{site-header,ats-shell}.tsx` |
| `lib/use-resource-crud.ts` | → `lib/hooks/use-resource-crud.ts`; stays — a small generic hook for the create/edit sheet + delete-confirm state (calls the feature's thunks) |

Uninstall `@reduxjs/toolkit/query` usage (the package stays for `createSlice`/`createAsyncThunk`).
After the move: delete `APPLICATION_TRANSITIONS` / `WITHDRAWABLE_STATUSES` from `constants.ts`
(read B1 fields off the API); `assessment-panel.tsx` uses B2 counts; `apply-button.tsx` uses B4;
ATS review detail (P3) uses B5 for résumé download.

### Data layer (replaces RTK Query)

- **`lib/api/client.ts`** — `apiClient<T>(path, init?)`: prepends `/api/bff/`, sets JSON headers,
  `credentials: 'include'`, parses the body, and on `!res.ok` throws
  `ApiError extends Error { status; detail }` — `.message` = the FastAPI `detail` (array 422 →
  joined). Multipart (`FormData` body) passes through untouched (used by `authService.signup`).
- **`features/<x>/<x>Service.ts`** — one thin async fn per endpoint, e.g.
  `getAll(params) → apiClient<Paginated<Position>>('positions?' + toQuery(params))`,
  `create(body) → apiClient<Position>('positions', { method:'POST', body: JSON.stringify(body) })`.
- **Thunks** (`createAsyncThunk`) just `await`/`return` the service call — no try/catch, no
  `rejectWithValue`. `action.error.message` in `.rejected` is the `ApiError.message` (the detail).
- **`lib/middleware/toast-error.ts`** — `action.type.endsWith('/rejected') && !action.meta.arg?.silent`
  → `toast.error(action.error.message ?? 'Something went wrong')`. This is the only place mutation
  failures surface a toast (replaces RTK Query's `baseQueryWithFeedback`).
- **Refetch policy:** the feature hook re-dispatches `fetch…` when its URL params change; mutation
  thunks' `.fulfilled` cases either splice the result into `state.data` or the hook re-dispatches
  `fetch…`. No timestamp cache, no background/focus refetch.

### BFF / auth flow, styling — unchanged from Phases 0–2

Cookies `ats_at` / `ats_rt`; `app/api/*` and `bff/[...path]` proxy with silent refresh; `proxy.ts`
guard; `(ats)/layout.tsx` role check. shadcn radix-nova style, `next-themes`, `data-surface` per
route group.

---

## Phased delivery

### Phase 2.5 — Backend prep + data-layer swap + feature-slice restructure  *(checkpoint)*
1. **Backend (`ats_fastapi`)**: B1–B5 with unit tests; `pytest` + `ruff` green; `CLAUDE.md` updated.
2. **Data layer**: `lib/api/client.ts` (`apiClient` + `ApiError`), `lib/middleware/toast-error.ts`;
   rewrite the store as `lib/store/store.ts` + `lib/store/*Slice.ts` (`configureStore`, no `baseApi`).
3. **Per feature** (`auth` first as the reference, then positions/tags/company-addresses, then
   job-posts/applications/assessments): write `<x>Service.ts` + `<x>Slice.ts` (8-section template)
   + `hooks.ts`; move + rename the components per the map; swap `useXQuery/useXMutation` for
   `useAppSelector` + `dispatch(thunk())` via the feature hook.
4. Delete the transition/withdrawable maps from `constants.ts`; wire B1–B4 into
   `application-detail-view` / `assessment-panel` / `apply-button`.
5. Re-verify every Phase 1 & 2 flow unchanged; `npm run build` + `npx eslint .` clean.

### Phase 3 — ATS core  ✅
- `features/dashboard/` — `<DashboardView>` StatCard rows from B3 stats.
- `features/job-posts/` — `job-posts-view` (list, filter status/type, search), `job-post-create-view`
  (Details form → redirects to `/[id]/edit`). Post routes split for clarity: `/ats/job-posts/[id]`
  = `job-post-applicants-view` (the review list scoped to that post + Preview / Edit); `/ats/job-posts/
  [id]/edit` = `job-post-edit-view` with tabs Details / Tags / Exclusions / Assessments
  (`_parts/*-panel.tsx`, dedicated add/remove endpoints) + delete.
- `features/applications/` — `review-view` (status filter), `application-review-detail-view`:
  `pipeline-stepper` + `status-actions` (buttons from `allowed_status_transitions`, B1),
  `extend-deadline-dialog`, `resume-download-button` (B5), `review-assessments` (progress + reopen
  expired attempts + deadline-extension history).
- New: `components/form/async-combobox.tsx` + `ComboField`; `features/templates/` (list-only for
  the job-post pickers — full CRUD is Phase 4); `lib/store/templatesSlice.ts`.
- Verified: build + eslint clean; job-post create → attach tag → attach template → publish;
  review list carries `allowed_status_transitions`; `applied → prescreening` moves, reverse 400s;
  résumé streams with `Content-Disposition`.

### Phase 4 — Assessment templates + RBAC  ✅
- `features/templates/` — `template-kind-view` (one kind per route, card grid, create via sheet;
  `/ats/templates` → redirects to `/ats/templates/pre-assessment`; sidebar "Assessments" is an
  accordion with the three kinds so only the open one fetches — `fetchTemplatesByKind`),
  `template-detail-view` (edit details + questions list + `_parts/question-form.tsx` with
  dynamic config fields per `question_type` → `buildQuestionConfig`). Append-only questions
  (backend has no edit/delete/reorder). `lib/store/templatesSlice.ts` (byKind + byId).
  `useTemplates` (all three at once) is now used only by the job-post form's template pickers.
- `features/rbac/` (admin-only page guard) — `role-permission-matrix.tsx` (Switch grid, optimistic
  toggle via `grant`/`revoke` 204s), `create-hr-account-form.tsx` (`POST /auth/hr-accounts`).
  `lib/store/rbacSlice.ts`.
- README written; sidebar links all resolve.
- Verified: templates create + add-question; rbac roles/permissions load, grant/revoke 204;
  admin-only guard redirects applicants; create-HR endpoint 201.

### Phase 5 — Clean-architecture restructure  ✅
Refactored the functionally-complete app onto the 4-layer / `ui/`-mirrors-`app/` structure above.
Pure moves + import rewrites — no behaviour change.
1. **Every feature** got `ui/{careers|ats}/` (+ `_parts/` where a view has private sub-components);
   view/column/form files moved in per the per-domain map above; `_components/` → `_parts/`.
   Domain-logic files (`<domain>Service.ts`, `schema.ts`, `hooks.ts`) stay at the feature root
   (`dashboard` / `profile` have no `schema.ts`; `profile` is `ui/careers/` only).
2. Imports rewritten (`@/features/<d>/<file>` → `@/features/<d>/ui/<surface>/<file>`); the one
   cross-domain component import (`application-detail-view` → `assessment-panel`) now points at
   `@/features/assessments/ui/careers/assessment-panel`; all 20 `app/**/page.tsx` view imports
   updated; `_parts/` files reach siblings via `../<file>`.
3. **Every `app/**/page.tsx`** wraps its view in `<Suspense fallback={…}>` with a real fallback:
   `<TableSkeleton/>` for lists (incl. the former `fallback={null}` on `jobs`), and a new
   `components/page-skeleton.tsx` (`DetailSkeleton` / `FormSkeleton`) for detail, dashboard, form,
   and auth routes. Static pages (`/`) stay plain.
4. `npm run build` ✓ · `tsc --noEmit` ✓ · `npx eslint .` ✓ (0) — no functional diff.

---

## Next.js 16 specifics (verified in `node_modules/next/dist/docs`)
- `proxy.ts` at root (named `proxy` export + `config.matcher`) — not `middleware.ts`.
- Route handlers `route.ts`; `params` is a **Promise** (`await params`).
- shadcn **radix-nova** style: imports `from "cn"` and `from "radix-ui"`, `Field` primitives (no
  `Form` component); `@tanstack/react-table` pinned **v8**.
- `react-hooks` eslint v7 is strict: no `setState` in effect bodies (use `useSyncExternalStore` /
  adjust-state-in-render), no ref access/write during render.
- All Redux behind `'use client'` `<Providers>`; `useSearchParams` consumers wrapped in `<Suspense>`.
- Data fetching is client-side (thunks in `'use client'` views); Server Components only do the
  auth/role guard (`lib/server/api.ts`) — they never dispatch.

## Verification (per phase + final)
1. Backend: infra up, `alembic upgrade head`, `create_admin`, `fastapi dev`.
2. Frontend `npm run dev`; `npm run build` + `npx eslint .` clean each phase.
3. Auth: applicant signup → careers; admin → `/ats`; applicant → `/ats` redirects to `/`.
4. Careers happy path: publish job → apply → assessments → complete.
5. ATS pipeline: `applied → prescreening → interview → success`; disallowed transitions absent
   (from `allowed_status_transitions`); extend deadline; download résumé; reopen expired attempt.
6. Lists: pagination / sort / filter round-trip through the URL.

## Status

Phases 0 → 5 built and verified — `npm run build` ✓ · `npx eslint .` ✓ (0) · `tsc --noEmit` ✓ ·
backend `uv run pytest` ✓ (125). Both surfaces functional end-to-end.

**Phase 5 (clean-architecture restructure) is done** — every feature now has its presentation under
`features/<domain>/ui/{careers|ats}/` (+ `_parts/`) mirroring the `app/` route surfaces, domain
logic (`<domain>Service`/`schema`/`hooks`) stays at the feature root, and every `page.tsx` renders
its view inside a `<Suspense>` with a real skeleton fallback. Pure move + import rewrite, no
behaviour change.

**Not committed** — per the user's no-auto-commit rule, both working trees (`rd/ats_next` and
`rd/ats_fastapi`) hold every change uncommitted. `rd/ats_fastapi`'s working tree also carried a
large pre-existing uncommitted refactor (HEAD is behind the `assessments/` restructure) that is
**not** part of this work.

### Deferred / known limitations (not blockers — documented in `ats_next/README.md`)
- **Assessment questions are append-only** — the backend has no question edit / delete / reorder
  endpoint, so `question-form` only adds. Order index auto-increments from the current max.
- **Résumé is download-only** (B5 streams the file) — no in-browser preview.
- **No standalone applicant directory** — the ATS shows applicant name/email from the
  `ApplicationReviewOut` projection; the review detail page reads it from the cached review list
  (falls back to "Applicant" if opened cold).
- **`GET /applications` review list** filters by typed `?status=` / `?job_post_id=` params +
  pagination only — no querybuilder search/sort (backend limitation, flagged in the B-table).
  Both filters are surfaced in the UI: `/ats/applications` has Job-post + Status `FilterSelect`s,
  and `/ats/job-posts/[id]` **is** the applicant list for that post (`ApplicantsPanel` →
  `useJobApplicants`, the review list pre-scoped to it, Role column dropped).
- **`dashboardSlice` is read-only** — only `loading`/`error`, no `pending`/`saving` (no mutations).
- **No frontend test suite**; no multi-round interviews, real-time updates, email, i18n, or the
  multi-zone subdomain split.

### If picked back up
The obvious next backend additions (each small, same domain conventions): question
edit/delete/reorder on the 3 template domains; `GET /applications/{id}` returning applicant
name/email; querybuilder on the review list; a résumé-preview (inline `Content-Disposition`)
variant of B5.
