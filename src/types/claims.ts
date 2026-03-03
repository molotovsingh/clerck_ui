import type { ClaimKind } from "./enums";

export interface Claim {
  id: number;
  text: string;
  kind: ClaimKind;
  source_refs: string[];
  created_at: string;
}

export interface ClaimCreate {
  text: string;
  kind: ClaimKind;
  source_refs?: string[];
}
