import { api } from "../client";
import type {
  AiValidationMetricsOut,
  AiCostSummaryOut,
  AiQualityTrendsOut,
  AiThroughputSummaryOut,
  AmendmentAcceptanceOut,
  AiClientEmailDraftOut,
  AiResearchJurisdictionPackOut,
} from "@/types/ai-analytics";

export const aiAnalyticsApi = {
  validation: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<AiValidationMetricsOut>(
      `/matters/${matterId}/ai-validation-metrics`,
      { params }
    ),
  validationTeam: (params?: { limit?: number; offset?: number }) =>
    api.get<AiValidationMetricsOut>("/ai-validation-metrics/team", { params }),

  cost: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<AiCostSummaryOut>(`/matters/${matterId}/ai-cost-summary`, {
      params,
    }),
  costTeam: (params?: { limit?: number; offset?: number }) =>
    api.get<AiCostSummaryOut>("/ai-cost-summary/team", { params }),

  quality: (matterId: string, days?: number) =>
    api.get<AiQualityTrendsOut>(
      `/matters/${matterId}/ai-quality-trends`,
      { params: { days: days ?? 30 } }
    ),
  qualityTeam: (days?: number) =>
    api.get<AiQualityTrendsOut>("/ai-quality-trends/team", {
      params: { days: days ?? 30 },
    }),

  throughput: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<AiThroughputSummaryOut>(
      `/matters/${matterId}/ai-throughput`,
      { params }
    ),
  throughputTeam: (params?: { limit?: number; offset?: number }) =>
    api.get<AiThroughputSummaryOut>("/ai-throughput/team", { params }),

  amendments: (matterId: string, days?: number) =>
    api.get<AmendmentAcceptanceOut>(
      `/matters/${matterId}/ai-amendment-acceptance`,
      { params: { days: days ?? 30 } }
    ),
  amendmentsTeam: (days?: number) =>
    api.get<AmendmentAcceptanceOut>("/ai-amendment-acceptance/team", {
      params: { days: days ?? 30 },
    }),

  clientEmails: (matterId: string) =>
    api.get<AiClientEmailDraftOut[]>(
      `/matters/${matterId}/ai-client-emails`
    ),

  jurisdictionPacks: () =>
    api.get<AiResearchJurisdictionPackOut[]>("/ai-research/jurisdiction-packs"),
};
