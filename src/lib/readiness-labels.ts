/**
 * Human-readable labels for readiness check keys.
 * Keys are a stable contract surface from the backend — branch on `key`, never on `detail`.
 * See: clerck/docs/FRONTY_APPROVAL_LOOP_HANDOFF.md → "Stable Readiness Keys"
 */
export const CHECK_LABELS: Record<string, string> = {
  intake_gate: "Case details complete",
  status_for_client_approval: "Ready for client review",
  intake_manifest: "Evidence uploaded",
  claim_source_refs: "Claims linked to evidence",
  approved_draft: "At least one document approved",
  required_v1_drafts_approved: "All required documents approved",
  status_for_court_bundle: "Ready for court filing",
  approval_metadata: "Client approval recorded",
};
