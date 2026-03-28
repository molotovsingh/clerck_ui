import type { JobType, JobStatus } from "./enums";

export interface Job {
  id: number;
  matter_id: number;
  job_type: JobType;
  status: JobStatus;
  queued_by: string | null;
  payload_json: Record<string, unknown> | null;
  result_json: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface JobCreate {
  job_type: JobType;
  payload?: Record<string, unknown>;
}
