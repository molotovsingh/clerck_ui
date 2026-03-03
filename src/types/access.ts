import type { MatterAccessRole } from "./enums";

export interface MatterAccess {
  actor: string;
  role: MatterAccessRole;
  created_at: string;
}

export interface MatterCapabilities {
  intake_context_write: boolean;
  draft_read: boolean;
  draft_comment: boolean;
  draft_write: boolean;
  claim_write: boolean;
  handoff_write: boolean;
  status_write: boolean;
  queue_jobs: boolean;
  export: boolean;
  upload_evidence: boolean;
  manage_access: boolean;
  compliance_write: boolean;
}

export interface MatterAccessSelf {
  actor: string;
  role: MatterAccessRole;
  capabilities: MatterCapabilities;
  write_blocked_by_handoff_actor: string | null;
}

export interface MatterAccessGrant {
  actor: string;
  role: MatterAccessRole;
}
