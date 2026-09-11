export const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export interface AvailabilityWindow {
  weekday: number; // 0 = Monday
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface InterviewConfig {
  slot_minutes: number;
  horizon_days: number;
  min_notice_hours: number;
  timezone: string;
}

export type LogisticsMode = "video" | "onsite";

/** A `company_addresses` row, resolved server-side wherever a preset or a
 * booked interview links to one — enough to render a map from lat/long. */
export interface ResolvedAddress {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state_province: string | null;
  postal_code: string | null;
  country: string;
  latitude: string | null;
  longitude: string | null;
}

/** A named, reusable video-call link or on-site address HR can drop into an
 * interview's logistics field with one click. An on-site preset can instead
 * link a saved company address (`company_address_id`) — `value` is then the
 * server-formatted text of that address, always current. */
export interface LogisticsPreset {
  id: string;
  mode: LogisticsMode;
  label: string;
  value: string;
  company_address_id: string | null;
  address: ResolvedAddress | null;
}

export interface LogisticsPresetInput {
  mode: LogisticsMode;
  label: string;
  value: string;
  company_address_id: string | null;
}

/** A calendar-date exception to the recurring weekly windows. Covers a single
 * day (end_date === start_date) or an inclusive range. `is_unavailable` blocks
 * the days outright; otherwise `start`/`end` replace that day's weekly hours. */
export interface DateOverride {
  id: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  is_unavailable: boolean;
  start: string | null; // "HH:MM"
  end: string | null; // "HH:MM"
  note: string | null;
}

export interface DateOverrideInput {
  start_date: string;
  end_date?: string;
  is_unavailable: boolean;
  start?: string | null;
  end?: string | null;
  note?: string | null;
}

export interface GlobalAvailability {
  config: InterviewConfig;
  windows: AvailabilityWindow[];
  overrides: DateOverride[];
  logistics_presets: LogisticsPreset[];
}

export interface GlobalAvailabilityInput {
  config: InterviewConfig;
  windows: AvailabilityWindow[];
  logistics_presets: LogisticsPresetInput[];
}

export interface Interviewer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface JobPostAvailability {
  uses_custom_windows: boolean;
  windows: AvailabilityWindow[]; // effective (custom if any, else global)
  interviewers: Interviewer[];
  config: InterviewConfig;
  uses_custom_logistics: boolean;
  logistics_presets: LogisticsPreset[]; // effective, per mode
}

export interface JobPostAvailabilityInput {
  windows: AvailabilityWindow[]; // empty => use the global calendar
  interviewer_ids: string[];
  logistics_presets: LogisticsPresetInput[]; // empty per mode => use global
}

export interface UpcomingInterview {
  application_id: string;
  applicant_name: string;
  job_title: string;
  mode: string;
  location_or_link: string | null;
  starts_at: string;
  ends_at: string;
}

export interface InterviewStatus {
  application_id: string;
  state: "awaiting" | "confirmed";
  starts_at: string | null;
}

/** Common IANA zones offered in the timezone picker. */
export const TIMEZONE_OPTIONS = [
  "Asia/Manila",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
] as const;
