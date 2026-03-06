import { useQuery } from "@tanstack/react-query";
import { aiAnalyticsApi } from "@/api/endpoints/ai-analytics";
import { queryKeys } from "@/lib/query-keys";

export function useAiCostSummary(matterId: string) {
  return useQuery({
    queryKey: queryKeys.aiAnalytics.cost(matterId),
    queryFn: () => aiAnalyticsApi.cost(matterId),
  });
}

export function useAiQualityTrends(matterId: string, days?: number) {
  return useQuery({
    queryKey: [...queryKeys.aiAnalytics.quality(matterId), days ?? 30],
    queryFn: () => aiAnalyticsApi.quality(matterId, days),
  });
}

export function useAiThroughput(matterId: string) {
  return useQuery({
    queryKey: queryKeys.aiAnalytics.throughput(matterId),
    queryFn: () => aiAnalyticsApi.throughput(matterId),
  });
}

export function useAiValidationMetrics(matterId: string) {
  return useQuery({
    queryKey: queryKeys.aiAnalytics.validation(matterId),
    queryFn: () => aiAnalyticsApi.validation(matterId),
  });
}

export function useAiAmendmentAcceptance(matterId: string, days?: number) {
  return useQuery({
    queryKey: [...queryKeys.aiAnalytics.amendments(matterId), days ?? 30],
    queryFn: () => aiAnalyticsApi.amendments(matterId, days),
  });
}
