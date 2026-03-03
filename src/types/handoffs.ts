import type { HandoffStatus } from "./enums";

export interface HandoffRequest {
  id: number;
  matter_id: number;
  requested_by: string;
  target_actor: string;
  note: string | null;
  status: HandoffStatus;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandoffRequestCreate {
  target_actor: string;
  note?: string;
}

export interface HandoffRequestResolve {
  status: HandoffStatus;
}

export interface HandoffActive {
  enforcement_enabled: boolean;
  active_handoff_id: number | null;
  active_target_actor: string | null;
  decided_at: string | null;
}
