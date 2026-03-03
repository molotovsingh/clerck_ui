/**
 * Known labels that need special casing (acronyms, brand names, plain-language rewrites).
 */
const LABEL_OVERRIDES: Record<string, string> = {
  ocr: "Scan for Text",
  claim_matrix: "Extract Claims",
  draft_generation: "Draft Document",
  liquidtext_pack: "LiquidText Pack",
};

/**
 * Converts snake_case or kebab-case strings into Title Case labels.
 * e.g. "general_dispute" → "General Dispute", "review_ready" → "Review Ready"
 */
export function formatLabel(s: string): string {
  if (LABEL_OVERRIDES[s]) return LABEL_OVERRIDES[s];
  return s
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
