export interface Evidence {
  id: number;
  source_relative_path: string;
  original_name: string;
  suffix: string;
  size_bytes: number;
  sha256: string;
  blob_path: string;
  ingested_at: string;
}

export interface DuplicateEvidence {
  id: number;
  source_relative_path: string;
  original_name: string;
  suffix: string;
  size_bytes: number;
  sha256: string;
}

export interface DuplicateCluster {
  sha256: string;
  count: number;
  total_size_bytes: number;
  evidence: DuplicateEvidence[];
}

export interface MatterSearchHit {
  id: number;
  source_relative_path: string;
  original_name: string;
  snippet: string;
}

export interface MatterSearchOut {
  query: string;
  total_hits: number;
  hits: MatterSearchHit[];
}
