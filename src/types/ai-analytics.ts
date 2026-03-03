export interface AiValidationMetric {
  run_public_id: string;
  matter_id: number;
  task_type: string;
  model_id: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  created_at: string;
}

export interface AiValidationMetricsOut {
  metrics: AiValidationMetric[];
  total: number;
}

export interface AiCostEntry {
  model_id: string;
  task_type: string;
  total_runs: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
}

export interface AiCostSummaryOut {
  entries: AiCostEntry[];
  total: number;
}

export interface AiQualityTrendPoint {
  date: string;
  avg_accuracy: number | null;
  avg_f1_score: number | null;
  run_count: number;
}

export interface AiQualityTrendsOut {
  trends: AiQualityTrendPoint[];
}

export interface AiThroughputEntry {
  task_type: string;
  total_runs: number;
  avg_duration_seconds: number | null;
  succeeded: number;
  failed: number;
}

export interface AiThroughputSummaryOut {
  entries: AiThroughputEntry[];
  total: number;
}

export interface AmendmentAcceptanceEntry {
  date: string;
  total_amendments: number;
  accepted: number;
  rejected: number;
  acceptance_rate: number | null;
}

export interface AmendmentAcceptanceOut {
  entries: AmendmentAcceptanceEntry[];
}
