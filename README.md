# FMC — ATS frontend (`ats_next`)

Next.js 16 frontend for the FastAPI ATS in `../ats_fastapi`. Two surfaces in one app:

| Surface | Routes | For |
|---|---|---|
| **fmc-careers** | `/`, `/jobs`, `/applications`, `/profile` | Applicants — browse & apply, take assessments, track status |
| **fmc-ats** | `/ats/**` | HR & admin — job posts, application pipeline, assessment templates, RBAC |

## Run

```bash
# 1. Backend (in ../ats_fastapi) — infra + API on :8000
docker compose up -d
uv run alembic upgrade head
uv run python -m app.scripts.create_admin      # first admin; use an @example.com address
PYTHONUTF8=1 uv run fastapi dev app/main.py --port 8000

# 2. This app on :3000
cp .env.example .env.local        # ATS_API_URL=http://localhost:8000
npm install
npm run dev
```

`npm run build` · `npm run lint` (`npx eslint .`).

## Architecture

- **BFF auth** — `app/api/auth/*` log in / out via the backend and store the JWTs in **httpOnly
  cookies**; `app/api/bff/[...path]/route.ts` proxies every API call to `/api/v1/*`, injecting the
  bearer and silently refreshing on 401. `proxy.ts` gates `/ats`, `/applications`, `/profile`;
  `app/(ats)/layout.tsx` enforces the `hr`/`admin` role; `/ats/rbac` is admin-only.
- **State** — Redux Toolkit **classic slices** (`createSlice` + `createAsyncThunk`), all in
  `lib/store/`. A per-feature `features/<domain>/<domain>Service.ts` holds the `fetch` calls;
  `lib/middleware/toast-error.ts` surfaces any rejected thunk. No RTK Query.
- **Structure** —
  - `lib/` — `api/`, `hooks/`, `utils/`, `store/`, `middleware/`, `auth/` (server), `server/`,
    plus `config` / `types` / `constants` / `cn` / `providers`.
  - `components/` — cross-feature only: `ui/` (shadcn), `data-table/`, `form/`, `layout/`, flat rest.
  - `features/<domain>/` — one folder per backend domain: `<domain>Service.ts`, `schema.ts`
    (zod + response types) and `hooks.ts` at the root; presentation under `ui/{careers,ats}/`
    (mirroring the route surfaces) with `_parts/` for a view's private sub-components.
  - `app/**/page.tsx` — routing only; each renders a `features/**` view inside `<Suspense>`.
    Job-post routes: `/ats/job-posts/[id]` lists that post's applicants; `…/[id]/edit` is the
    Details / Tags / Exclusions / Assessments editor. Assessment templates are one route per
    kind (`/ats/templates/<pre-assessment|culture-fit|technical-assessment>`), reached from the
    sidebar's "Assessments" accordion — only the open kind is fetched.
- **Rule** — the frontend requests & renders; the backend computes. Allowed status transitions,
  `can_withdraw`, assessment progress counts and dashboard tallies all come off the API.

## Backend additions this frontend relies on

`GET /assessment-attempts/{id}` (take-assessment view), `allowed_status_transitions` + `can_withdraw`
on `ApplicationOut`, `answered_count`/`total_questions` on `AssessmentAttemptOut`,
`GET /applications/stats` + `GET /job-posts/stats`, `GET /applications/me?job_post_id=`,
`GET /applications/{id}/resume`. See `../ats_fastapi/CLAUDE.md`.

## Assessment template authoring

Split into three routes per kind (`pre-assessment` / `culture-fit` / `technical-assessment`):

| Route | View |
|---|---|
| `/ats/templates/<kind>` | list of templates |
| `/ats/templates/<kind>/new` | create form (redirects to `…/edit` on success) |
| `/ats/templates/<kind>/<id>` | **read-only bento view** — overview, timers, instructions, question-type mix, question list |
| `/ats/templates/<kind>/<id>/edit` | edit template details + **add / edit in place / delete / reorder (up-down)** questions |

Question config is per-type — choice `options` + `min/max_selections`, `number`/`rating` bounds,
`text` `max_length`, `date` bounds. Backed by `PUT`/`DELETE /{kind}-templates/{id}/questions/{qid}`
and `PUT /{kind}-templates/{id}/questions/reorder` (all return the refreshed template). No guard
against editing a question after applicants have attempts against the template — HR's call.

Instructions live **only at the template level** (shown to the applicant once before the attempt
starts) — there is no per-question instructions field.

## Known limitations

No résumé preview (download only). Applicant directory is limited to what the review-list
projection carries.
