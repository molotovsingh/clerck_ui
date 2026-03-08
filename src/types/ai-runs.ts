import { JobStatus } from "./enums";

export interface AiRun {
  id: number;
  run_public_id: string;
  matter_id: number;
  job_id: number | null;
  actor: string;
  stage: string;
  task_type: string;
  task_tier: string;
  model_id: string;
  prompt_template_version: string;
  output_artifact_id: number | null;
  metadata_json: Record<string, unknown> | null;
  cost_json: Record<string, unknown> | null;
  status: JobStatus;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}
