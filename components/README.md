# Component organization

Page UI lives in `components/<domain>/<surface>/<page>/`. Each page directory owns its
view, columns, forms, dialogs, and smaller feature directories. `ats` and `careers`
separate the staff and applicant surfaces. This is one Next.js application with
page modules that teams can own independently; these directories are not separate deployments.

```text
app/(ats)/ats/job-posts/[id]/edit/page.tsx
  → components/job-posts/ats/edit/job-post-edit-view.tsx
      → details/details-panel.tsx
      → tags/tags-panel.tsx
      → exclusions/exclusions-panel.tsx
      → assessments/templates-panel.tsx
```

```text
components/
  job-posts/
    ats/
      list/                  # Job-post table and columns
      applicants/            # Applicants page and table panel
      create/                # Create page
      edit/                  # Edit page composes its feature panels
        details/
        tags/
        exclusions/
        assessments/
      shared/                # Components reused by staff job-post pages
        form/                # Create/edit form and its existing option loader
    careers/
      list/                  # Public job list and job card
      detail/                # Job details and apply button
  applications/
    ats/
      review-detail/
        pipeline/
        assessments/
        evaluation/
        interview/
      compare/
        compare-view.tsx
        scorecard/
        assessment-answers/
        evaluation/
        import-export/
        shared/              # Helpers used only by this page
    shared/                  # Interview summary used on both surfaces
  dashboard/ats/overview/
    dashboard-view.tsx
    analytics/
      analytics-panel.tsx
      overview/
      hiring/
      roles/
      assessments/
      evaluations/
    shared/                  # Work queue used by dashboard and analytics
  ui/                        # Shared shadcn primitives
  data-table/                # Shared table components
  form/                      # Shared form controls
  layout/                    # Application shells and headers
```

## Where new components belong

- Start in the page that uses the component. For a distinct workflow, create a named
  subdirectory such as `edit/questions/` or `compare/import-export/`.
- Keep reusable pieces at the narrowest shared level: `<page>/shared/` for one page,
  `<domain>/<surface>/shared/` for several pages, or `<domain>/shared/` for both surfaces.
- Use the global UI, table, and form directories for components that work across domains.
  Authentication's connected user menu belongs in `auth/shared/`.
- Import the page's `*-view.tsx` from its route. Compose private child components in that
  view; use relative imports within a page and `@/components/...` across domains.
- Keep metadata, route params, redirects, and server access checks in `app/`. Preserve
  existing client boundaries and client-only dynamic imports when extracting components.
- Keep service calls, schemas, existing domain hooks, and Redux in their existing locations.
  Connected page components can keep using them; reusable presentation components should
  receive data and callbacks through props when practical.

## Page ownership

| Domain | Page directories on the staff surface |
| --- | --- |
| Applications | `applicants`, `applicant-detail`, `review`, `review-detail`, `pipeline`, `compare` |
| Company addresses | `list` with `form`, `details`, and shared map components |
| Dashboard | `overview`, including its embedded analytics sections |
| Interviews | `schedule`, `availability`, `date-overrides`, `job-post-scheduling` |
| Job posts | `list`, `applicants`, `create`, `edit` |
| Positions / tags | Each domain has its own `list` with form and columns |
| RBAC | `permissions`, `staff`, `applicants`, `create-user`, `edit-user` |
| Templates | `list`, `detail`, `create`, `edit` with question authoring |

The route may compose UI owned by another domain. For example, job-post comparison
uses the applications domain, and job-post scheduling uses the interviews domain.
The careers surface follows the same convention for home, authentication, jobs,
applications, profile, and assessment attempts.
