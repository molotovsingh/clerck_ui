import type { MatterStatus } from "./enums";

export interface Matter {
  public_id: string;
  name: string;
  client_name: string;
  matter_class: string;
  retention_policy: string | null;
  legal_hold: boolean;
  status: MatterStatus;
  created_at: string;
  updated_at: string;
}

export interface MatterCreate {
  name: string;
  client_name: string;
  matter_class: string;
}

export interface MatterStatusUpdate {
  status: MatterStatus;
  approval_name?: string;
  approval_date?: string;
}

export interface LatestValidation {
  job_id: number;
  generated_at: string;
  critical_failures: string[];
  stale_section_count: number;
}

export interface MatterReadiness {
  matter_public_id: string;
  matter_status: MatterStatus;
  intake_gate_passed: boolean;
  validation_gate_passed: boolean;
  ready_for_client_approval: boolean;
  ready_for_court_bundle: boolean;
  approval_name: string | null;
  approval_date: string | null;
  checks: MatterReadinessCheck[];
  latest_validation: LatestValidation | null;
}

export interface MatterReadinessCheck {
  key: string;
  ok: boolean;
  detail: string;
}

export interface AuditEvent {
  actor: string;
  action: string;
  detail_json: Record<string, unknown> | null;
  created_at: string;
}

export interface MatterComplianceOptions {
  default_matter_class: string;
  allowed_matter_classes: string[];
  default_retention_policy: string;
  default_retention_policy_by_matter_class: Record<string, string>;
  allowed_retention_policies: string[];
}

export interface MatterComplianceUpdate {
  matter_class?: string;
  retention_policy?: string;
  legal_hold?: boolean;
}

export interface MatterDeletionRequest {
  request_public_id: string;
  matter_id: number;
  requested_by: string;
  reason: string;
  status: string;
  blocked_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatterDeletionRequestCreate {
  reason: string;
}
