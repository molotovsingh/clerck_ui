import type { DraftStatus } from "./enums";

export interface Draft {
  id: number;
  matter_id: number;
  title: string;
  doc_type: string;
  status: DraftStatus;
  latest_version: number;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DraftCreate {
  title: string;
  doc_type: string;
  content?: string;
  change_summary?: string;
  status?: DraftStatus;
}

export interface DraftStatusUpdate {
  status: DraftStatus;
}

export interface DraftVersion {
  id: number;
  draft_id: number;
  version_number: number;
  content: string;
  change_summary: string;
  created_by: string;
  created_at: string;
}

export interface DraftVersionCreate {
  content: string;
  change_summary: string;
}

export interface DraftVersionCompare {
  from_version: number;
  to_version: number;
  added_lines: number;
  removed_lines: number;
  changed: boolean;
  unified_diff: string;
}

export interface RequiredV1DraftCoverage {
  matter_public_id: string;
  complete: boolean;
  required: RequiredV1DraftItem[];
}

export interface RequiredV1DraftItem {
  doc_type: string;
  title: string;
  exists: boolean;
  approved: boolean;
  draft_id: number | null;
  status: string | null;
}
