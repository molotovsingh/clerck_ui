// ── Validation ────────────────────────────────────────────────────

export interface AiValidationRunMetric {
  job_id: number;
  created_at: string;
  score_percent: number;
  target_percent: number;
  quality_band: string;
  critical_failure_count: number;
  critical_failures: string[];
  unsupported_claim_count: number;
  authority_citation_gap_count: number;
  potential_contradiction_count: number;
}

export interface AiValidationMetricsOut {
  total_runs: number;
  critical_failure_runs: number;
  critical_failure_rate_percent: number;
  unsupported_claim_runs: number;
  authority_gap_runs: number;
  contradiction_runs: number;
  average_score_percent: number;
  latest_score_percent: number | null;
  latest_quality_band: string | null;
  runs: AiValidationRunMetric[];
}

// ── Quality trends ───────────────────────────────────────────────

export interface AiQualityTrendPoint {
  date: string;
  run_count: number;
  average_score_percent: number;
  unsupported_claim_runs: number;
  unsupported_claim_rate_percent: number;
  authority_gap_runs: number;
  authority_gap_rate_percent: number;
  contradiction_runs: number;
  contradiction_rate_percent: number;
  critical_failure_runs: number;
  critical_failure_rate_percent: number;
}

export interface AiQualityTrendsOut {
  days: number;
  total_runs: number;
  window_start_date: string;
  window_end_date: string;
  points: AiQualityTrendPoint[];
}

// ── Cost ─────────────────────────────────────────────────────────

export interface AiCostRun {
  run_public_id: string;
  job_id: number | null;
  stage: string;
  task_type: string;
  model_id: string;
  status: string;
  created_at: string;
  cost_usd: number;
}

export interface AiCostStageSummary {
  stage: string;
  run_count: number;
  total_cost_usd: number;
  average_cost_usd: number;
}

export interface AiCostSummaryOut {
  total_runs: number;
  total_cost_usd: number;
  average_cost_usd: number;
  latest_cost_usd: number | null;
  soft_budget_usd: number;
  utilization_percent: number;
  alert_50: boolean;
  alert_80: boolean;
  alert_100: boolean;
  stage_breakdown: AiCostStageSummary[];
  runs: AiCostRun[];
}

// ── Throughput ───────────────────────────────────────────────────

export interface AiThroughputRun {
  run_public_id: string;
  job_id: number | null;
  stage: string;
  status: string;
  created_at: string;
  queue_wait_seconds: number | null;
  runtime_seconds: number | null;
  end_to_end_seconds: number | null;
}

export interface AiThroughputStageSummary {
  stage: string;
  run_count: number;
  succeeded_runs: number;
  failed_runs: number;
  running_runs: number;
  avg_queue_wait_seconds: number;
  avg_runtime_seconds: number;
  p95_runtime_seconds: number | null;
  avg_end_to_end_seconds: number;
}

export interface AiThroughputSummaryOut {
  total_runs: number;
  succeeded_runs: number;
  failed_runs: number;
  running_runs: number;
  avg_queue_wait_seconds: number;
  avg_runtime_seconds: number;
  p95_runtime_seconds: number | null;
  avg_end_to_end_seconds: number;
  stage_breakdown: AiThroughputStageSummary[];
  runs: AiThroughputRun[];
}

// ── Amendment acceptance ─────────────────────────────────────────

export interface AmendmentAcceptancePoint {
  date: string;
  total_amendments: number;
  accepted_amendments: number;
  pending_amendments: number;
  acceptance_rate_percent: number;
}

export interface AmendmentAcceptanceOut {
  days: number;
  total_amendments: number;
  accepted_amendments: number;
  pending_amendments: number;
  acceptance_rate_percent: number;
  window_start_date: string;
  window_end_date: string;
  points: AmendmentAcceptancePoint[];
}
