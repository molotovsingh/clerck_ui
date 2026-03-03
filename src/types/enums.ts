export enum Role {
  ADMIN = "admin",
  RECORDS_OWNER = "records_owner",
  REVIEWER = "reviewer",
  DRAFTER = "drafter",
  WORKER = "worker",
}

export enum MatterStatus {
  INTAKE = "Intake",
  UNDER_REVIEW = "Under Review",
  CLIENT_APPROVED = "Client Approved",
  FILED = "Filed",
}

export enum DraftStatus {
  DRAFT = "draft",
  REVIEW_READY = "review_ready",
  APPROVED = "approved",
}

export enum ClaimKind {
  QUOTE = "quote",
  PARAPHRASE = "paraphrase",
  INFERENCE = "inference",
}

export enum JobType {
  OCR = "ocr",
  TIMELINE = "timeline",
  CLAIM_MATRIX = "claim_matrix",
  RESEARCH = "research",
  DRAFT_GENERATION = "draft_generation",
  PLEADING_PLAINT_STARTER = "pleading_plaint_starter",
  PLEADING_WRITTEN_STATEMENT_STARTER = "pleading_written_statement_starter",
  VALIDATION = "validation",
  CLIENT_EMAIL_FACT_REQUEST = "client_email_fact_request",
  CLIENT_EMAIL_FEEDBACK_REQUEST = "client_email_feedback_request",
}

export enum JobStatus {
  QUEUED = "queued",
  RUNNING = "running",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

export enum MatterAccessRole {
  OWNER = "owner",
  REVIEWER = "reviewer",
  DRAFTER = "drafter",
  VIEWER = "viewer",
}

export enum HandoffStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  CANCELED = "canceled",
}

export enum ArtifactKind {
  INTAKE_MANIFEST = "intake_manifest",
  SHAREABLE_PACK = "shareable_pack",
  COURT_BUNDLE = "court_bundle",
  LIQUIDTEXT_PACK = "liquidtext_pack",
}

export enum AiMessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum MatterDeletionStatus {
  PENDING = "pending",
  BLOCKED_LEGAL_HOLD = "blocked_legal_hold",
}
