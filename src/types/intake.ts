export interface IntakeContext {
  dispute_template: string | null;
  context_inputs: Record<string, unknown>;
  narrative: string | null;
  completed_at: string | null;
  gate_passed: boolean;
}

export interface IntakeContextUpdate {
  dispute_template?: string | null;
  context_inputs?: Record<string, unknown>;
  narrative?: string | null;
}

export interface IntakeIngestOut {
  matter_id: number;
  source_dir: string;
  files_seen: number;
  files_added: number;
  files_skipped: number;
  duplicate_groups: number;
  manifest_path: string;
}
