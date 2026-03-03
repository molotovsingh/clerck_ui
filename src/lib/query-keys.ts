export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    tokens: ["auth", "tokens"] as const,
    preferences: ["auth", "preferences"] as const,
  },
  matters: {
    all: ["matters"] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      ["matters", "list", params] as const,
    detail: (id: string) => ["matters", id] as const,
    readiness: (id: string) => ["matters", id, "readiness"] as const,
    audit: (id: string) => ["matters", id, "audit"] as const,
    compliance: (id: string) => ["matters", id, "compliance"] as const,
    complianceOptions: (id: string) =>
      ["matters", id, "compliance", "options"] as const,
    deletionRequests: (id: string) =>
      ["matters", id, "deletion-requests"] as const,
  },
  evidence: {
    list: (matterId: string) => ["matters", matterId, "evidence"] as const,
    duplicates: (matterId: string) =>
      ["matters", matterId, "duplicates"] as const,
    search: (matterId: string, q: string) =>
      ["matters", matterId, "search", q] as const,
  },
  claims: {
    list: (matterId: string) => ["matters", matterId, "claims"] as const,
  },
  intake: {
    context: (matterId: string) =>
      ["matters", matterId, "intake", "context"] as const,
  },
  drafts: {
    list: (matterId: string) => ["matters", matterId, "drafts"] as const,
    requiredV1: (matterId: string) =>
      ["matters", matterId, "drafts", "required-v1"] as const,
    versions: (matterId: string, draftId: number) =>
      ["matters", matterId, "drafts", draftId, "versions"] as const,
    compare: (
      matterId: string,
      draftId: number,
      from: number,
      to: number
    ) =>
      [
        "matters",
        matterId,
        "drafts",
        draftId,
        "compare",
        from,
        to,
      ] as const,
    sections: (matterId: string, draftId: number) =>
      ["matters", matterId, "drafts", draftId, "sections"] as const,
    versionSections: (
      matterId: string,
      draftId: number,
      versionNumber: number
    ) =>
      [
        "matters",
        matterId,
        "drafts",
        draftId,
        "versions",
        versionNumber,
        "sections",
      ] as const,
    comments: (matterId: string, draftId: number, sectionKey: string) =>
      [
        "matters",
        matterId,
        "drafts",
        draftId,
        "sections",
        sectionKey,
        "comments",
      ] as const,
  },
  jobs: {
    list: (matterId: string) => ["matters", matterId, "jobs"] as const,
    detail: (jobId: number) => ["jobs", jobId] as const,
  },
  access: {
    list: (matterId: string) => ["matters", matterId, "access"] as const,
    self: (matterId: string) =>
      ["matters", matterId, "access", "self"] as const,
  },
  handoffs: {
    list: (matterId: string) => ["matters", matterId, "handoffs"] as const,
    active: (matterId: string) =>
      ["matters", matterId, "handoffs", "active"] as const,
  },
  artifacts: {
    list: (matterId: string) => ["matters", matterId, "artifacts"] as const,
  },
  aiThreads: {
    list: (matterId: string) =>
      ["matters", matterId, "ai-threads"] as const,
    detail: (threadId: string) => ["ai-threads", threadId] as const,
    messages: (threadId: string) =>
      ["ai-threads", threadId, "messages"] as const,
  },
  aiRuns: {
    list: (matterId: string) => ["matters", matterId, "ai-runs"] as const,
    detail: (runId: string) => ["ai-runs", runId] as const,
    forJob: (jobId: number) => ["jobs", jobId, "ai-runs"] as const,
  },
  aiAnalytics: {
    validation: (matterId: string) =>
      ["matters", matterId, "ai-validation-metrics"] as const,
    validationTeam: ["ai-validation-metrics", "team"] as const,
    cost: (matterId: string) =>
      ["matters", matterId, "ai-cost-summary"] as const,
    costTeam: ["ai-cost-summary", "team"] as const,
    quality: (matterId: string) =>
      ["matters", matterId, "ai-quality-trends"] as const,
    qualityTeam: ["ai-quality-trends", "team"] as const,
    throughput: (matterId: string) =>
      ["matters", matterId, "ai-throughput"] as const,
    throughputTeam: ["ai-throughput", "team"] as const,
    amendments: (matterId: string) =>
      ["matters", matterId, "ai-amendment-acceptance"] as const,
    amendmentsTeam: ["ai-amendment-acceptance", "team"] as const,
  },
} as const;
