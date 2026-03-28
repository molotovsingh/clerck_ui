export const AUTH_STORAGE_KEY = "firmcase-auth";
export const DEFAULT_PAGE_LIMIT = 200;

export function paginationParams(params?: { limit?: number; offset?: number }) {
  return {
    limit: params?.limit ?? DEFAULT_PAGE_LIMIT,
    offset: params?.offset ?? 0,
  };
}

// Backend-enforced allowed values for matter_class.
// See BACKEND_NOTE_matter_class.md for context.
export const MATTER_CLASSES = [
  { value: "general_dispute", label: "General Dispute" },
  { value: "debt_recovery", label: "Debt Recovery" },
  { value: "employment_dispute", label: "Employment Dispute" },
  { value: "regulatory_enforcement", label: "Regulatory Enforcement" },
] as const;
