import type { ArtifactKind } from "./enums";

export interface Artifact {
  id: number;
  kind: ArtifactKind;
  path: string;
  sha256: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface ExportPackCreate {
  kind: ArtifactKind;
  approved_by?: string;
  approved_date?: string;
}

export interface ExportPackOut {
  artifact_id: number;
  kind: ArtifactKind;
  path: string;
  sha256: string;
  reused_existing: boolean;
  evidence_count: number;
  claim_count: number;
}
