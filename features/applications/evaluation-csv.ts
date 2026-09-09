/** Parse the AI-filled evaluation CSV (round-trip of `evaluation-template.csv`)
 * into the JSON payload the import endpoint expects. */

const RESUME_DIMENSIONS = [
  "relevant_work_experience",
  "industry_experience",
  "employment_gap",
  "tenure_stability",
  "career_progression",
  "job_hopping_risk",
  "educational_background",
  "certifications_licenses",
  "technical_skills_match",
] as const;

const ASSESSMENT_DIMENSIONS = [
  "pre_assessment",
  "culture_fit",
  "technical",
] as const;

const VALID_RATINGS = new Set(["strong", "qualified", "below_bar", "na"]);

/** Minimal RFC-4180 CSV parser (handles quoted fields, embedded commas/newlines). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

export interface ImportPayload {
  job_post_id: string;
  model: string;
  evaluations: Array<Record<string, unknown>>;
}

export function parseEvaluationCsv(text: string, jobId: string): ImportPayload {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("The CSV has no data rows.");

  const header = rows[0].map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);
  const appIdCol = idx("application_id");
  if (appIdCol === -1)
    throw new Error("The CSV is missing an `application_id` column.");

  const scores = (row: string[], prefix: string, dims: readonly string[]) =>
    dims
      .map((d) => ({
        dimension: d,
        rating: (row[idx(`${prefix}__${d}`)] ?? "").trim().toLowerCase(),
        reason: (row[idx(`${prefix}__${d}__reason`)] ?? "").trim() || null,
      }))
      .filter((s) => s.rating && VALID_RATINGS.has(s.rating));

  const evaluations = rows
    .slice(1)
    .map((row) => {
      const get = (name: string) => (row[idx(name)] ?? "").trim();
      const fitRaw = get("fit_score");
      const fitNum = Number(fitRaw);
      return {
        application_id: (row[appIdCol] ?? "").trim(),
        seniority_assessed: get("seniority_assessed") || null,
        fit_score:
          fitRaw === "" || !Number.isFinite(fitNum) ? null : Math.round(fitNum),
        recommendation: get("recommendation").toLowerCase() || null,
        summary: get("summary") || null,
        resume_scores: scores(row, "resume", RESUME_DIMENSIONS),
        assessment_scores: scores(row, "assessment", ASSESSMENT_DIMENSIONS),
      };
    })
    .filter((e) => e.application_id !== "");

  return { job_post_id: jobId, model: "chatgpt", evaluations };
}
