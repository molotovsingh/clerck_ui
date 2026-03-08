/**
 * Matter types — sourced from the generated OpenAPI contract.
 * Run `npm run sync:contract && npm run generate:types` to refresh.
 *
 * Fields that the backend returns as string unions (e.g. MatterStatus)
 * are narrowed here to our local enums so existing code stays unchanged.
 */
import type { components } from "@/generated/api-types";
import type { MatterStatus, MatterDeletionStatus } from "./enums";

// The generated MatterOut uses a string-union for `status`;
// we override it with our MatterStatus enum for local type safety.
export type Matter = Omit<components["schemas"]["MatterOut"], "status"> & {
  status: MatterStatus;
};

export type MatterCreate = components["schemas"]["MatterCreate"];

export type MatterStatusUpdate = Omit<
  components["schemas"]["MatterStatusUpdate"],
  "status"
> & {
  status: MatterStatus;
};

export type MatterReadiness = Omit<
  components["schemas"]["MatterReadinessOut"],
  "matter_status"
> & {
  matter_status: MatterStatus;
};

export type MatterReadinessCheck =
  components["schemas"]["MatterReadinessCheck"];

export type AuditEvent = components["schemas"]["AuditEventOut"];

export type MatterComplianceOptions =
  components["schemas"]["MatterComplianceOptionsOut"];

export type MatterComplianceUpdate =
  components["schemas"]["MatterComplianceUpdate"];

export type MatterDeletionRequest = Omit<
  components["schemas"]["MatterDeletionRequestOut"],
  "status"
> & {
  status: MatterDeletionStatus;
};

export type MatterDeletionRequestCreate =
  components["schemas"]["MatterDeletionRequestCreate"];
