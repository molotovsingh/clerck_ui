export interface DraftSection {
  id: number;
  draft_version_id: number;
  section_key: string;
  heading: string;
  content: string;
  order_index: number;
  stale: boolean;
  source_refs: string[];
  created_at: string;
  updated_at: string;
}

export interface DraftSectionAmend {
  content?: string;
  heading?: string;
  source_refs?: string[];
  change_summary: string;
}

export interface DraftSectionRegenerate {
  instruction: string;
  thread_public_id?: string;
  change_summary: string;
}

export interface DraftSectionRegenerateOut {
  version: number;
  ai_run_public_id: string;
  execution_mode: string;
}

export interface DraftSectionComment {
  id: number;
  matter_id: number;
  draft_id: number;
  draft_version_id: number;
  section_key: string;
  actor: string;
  content: string;
  created_at: string;
}

export interface DraftSectionCommentCreate {
  content: string;
}
