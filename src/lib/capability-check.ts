import type { MatterCapabilities } from "@/types/access";

export function canPerform(
  capabilities: MatterCapabilities | null | undefined,
  capability: keyof MatterCapabilities
): boolean {
  if (!capabilities) return false;
  return capabilities[capability] === true;
}
