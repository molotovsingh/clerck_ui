/**
 * Workspace types — sourced from the generated OpenAPI contract.
 * Run `npm run sync:contract && npm run generate:types` to refresh.
 */
import type { components } from "@/generated/api-types";
import type { MatterStatus } from "./enums";
import type { Matter, MatterReadiness } from "./matters";
import type { MatterAccessSelf, MatterCapabilities } from "./access";

export type MatterWorkspaceOut = Omit<
  components["schemas"]["MatterWorkspaceOut"],
  "workflow_state" | "matter" | "self_access"
> & {
  matter: Matter;
  workflow_state: MatterWorkflowState;
  self_access: MatterAccessSelf;
};

export type MatterWorkflowState = Omit<
  components["schemas"]["MatterWorkflowStateOut"],
  "matter_status" | "readiness" | "capabilities" | "allowed_transitions"
> & {
  matter_status: MatterStatus;
  allowed_transitions: MatterStatus[];
  readiness: MatterReadiness;
  capabilities: MatterCapabilities;
};

export type MatterWorkspaceSummary =
  components["schemas"]["MatterWorkspaceSummaryOut"];

export type MatterWorkspaceCollections =
  components["schemas"]["MatterWorkspaceCollectionsOut"];
