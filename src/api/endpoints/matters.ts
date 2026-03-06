import { api } from "../client";
import type {
  Matter,
  MatterCreate,
  MatterStatusUpdate,
  MatterReadiness,
  AuditEvent,
  MatterComplianceOptions,
  MatterComplianceUpdate,
  MatterDeletionRequest,
  MatterDeletionRequestCreate,
} from "@/types/matters";
import type { MatterWorkspaceOut, MatterWorkflowState } from "@/types/workspace";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";

export const mattersApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get<Matter[]>("/matters", {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  get: (id: string) => api.get<Matter>(`/matters/${id}`),

  create: (data: MatterCreate) =>
    api.post<Matter>("/matters", { body: data }),

  updateStatus: (id: string, data: MatterStatusUpdate) =>
    api.patch<Matter>(`/matters/${id}/status`, { body: data }),

  getReadiness: (id: string) =>
    api.get<MatterReadiness>(`/matters/${id}/readiness`),

  listAudit: (id: string, params?: { limit?: number; offset?: number }) =>
    api.get<AuditEvent[]>(`/matters/${id}/audit`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  getComplianceDefaults: () =>
    api.get<MatterComplianceOptions>("/compliance/defaults"),

  getComplianceOptions: (id: string) =>
    api.get<MatterComplianceOptions>(`/matters/${id}/compliance/options`),

  updateCompliance: (id: string, data: MatterComplianceUpdate) =>
    api.patch<Matter>(`/matters/${id}/compliance`, { body: data }),

  createDeletionRequest: (id: string, data: MatterDeletionRequestCreate) =>
    api.post<MatterDeletionRequest>(`/matters/${id}/deletion-requests`, {
      body: data,
    }),

  listDeletionRequests: (
    id: string,
    params?: { limit?: number; offset?: number }
  ) =>
    api.get<MatterDeletionRequest[]>(`/matters/${id}/deletion-requests`, {
      params: { limit: params?.limit ?? DEFAULT_PAGE_LIMIT, offset: params?.offset ?? 0 },
    }),

  getWorkspace: (matterId: string, include?: string[], previewLimit?: number) =>
    api.get<MatterWorkspaceOut>(`/matters/${matterId}/workspace`, {
      params: {
        include: include ? [...new Set(include)].sort().join(",") : undefined,
        preview_limit: previewLimit,
      },
    }),

  getWorkflowState: (matterId: string) =>
    api.get<MatterWorkflowState>(`/matters/${matterId}/workflow-state`),
};
