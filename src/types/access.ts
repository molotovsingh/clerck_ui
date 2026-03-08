/**
 * Access types — sourced from the generated OpenAPI contract.
 * Run `npm run sync:contract && npm run generate:types` to refresh.
 */
import type { components } from "@/generated/api-types";

export type MatterAccess = components["schemas"]["MatterAccessOut"];

export type MatterCapabilities =
  components["schemas"]["MatterAccessCapabilitiesOut"];

export type MatterAccessSelf = Omit<
  components["schemas"]["MatterAccessSelfOut"],
  "write_blocked_by_handoff_actor"
> & {
  write_blocked_by_handoff_actor: string | null;
};

export type MatterAccessGrant = components["schemas"]["MatterAccessGrant"];
