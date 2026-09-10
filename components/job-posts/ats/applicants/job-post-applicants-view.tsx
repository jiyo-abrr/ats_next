"use client";

import { ApplicantsPanel } from "./applicants-panel";

/** "Applicants" tab of the job-post detail page — header/tabs come from the
 * (overview) layout's JobPostDetailChrome. */
export function JobPostApplicantsView({ id }: { id: string }) {
  return <ApplicantsPanel jobPostId={id} />;
}
