import type { AiMessageRole } from "./enums";

export interface AiThread {
  id: number;
  thread_public_id: string;
  matter_id: number;
  draft_id: number | null;
  section_key: string | null;
  title: string;
  created_by: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AiThreadCreate {
  title: string;
  draft_id?: number;
  section_key?: string;
  metadata?: Record<string, unknown>;
}

export interface AiThreadMessage {
  id: number;
  thread_id: number;
  role: AiMessageRole;
  actor: string;
  content: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface AiThreadMessageCreate {
  role: AiMessageRole;
  content: string;
  metadata?: Record<string, unknown>;
}
