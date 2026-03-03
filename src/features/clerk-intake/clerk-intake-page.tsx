import { useParams, Link } from "@tanstack/react-router";
import { useMatter, useUpdateMatterStatus } from "@/hooks/use-matters";
import {
  useIntakeContext,
  useUpdateIntakeContext,
  useUploadFiles,
} from "@/hooks/use-intake";
import { useEvidence } from "@/hooks/use-evidence";
import { useJobs, useQueueJob } from "@/hooks/use-jobs";
import { MatterStatus, JobType, JobStatus } from "@/types/enums";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatLabel } from "@/lib/format-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { ErrorDisplay } from "@/components/common/error-display";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  FolderUp,
  Plus,
  Trash2,
  Clock,
  Search,
  ListChecks,
  FileSignature,
  ScanLine,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatRelative } from "@/lib/format-date";

// ─── File Filtering ────────────────────────────────────────────────

const REJECTED_EXTENSIONS = new Set([
  ".ds_store", ".thumbs.db", ".desktop.ini", ".spotlight-v100",
  ".trashes", ".fseventsd", ".volumeicon.icns",
  ".exe", ".msi", ".bat", ".cmd", ".com", ".scr", ".pif",
  ".app", ".dmg", ".pkg", ".deb", ".rpm",
  ".sh", ".bash", ".csh", ".ps1", ".vbs", ".wsf",
  ".dll", ".so", ".dylib", ".sys", ".drv", ".o", ".obj",
  ".class", ".pyc", ".pyo", ".wasm",
  ".iso", ".img", ".vmdk", ".ova",
  ".tmp", ".temp", ".swp", ".swo", ".lock",
]);

const REJECTED_PREFIXES = [".", "~", "__MACOSX"];

function filterFiles(files: File[]): { accepted: File[]; rejected: File[] } {
  const accepted: File[] = [];
  const rejected: File[] = [];
  for (const file of files) {
    const name = file.name.toLowerCase();
    const ext = name.includes(".") ? "." + name.split(".").pop()! : "";
    const isJunk =
      REJECTED_EXTENSIONS.has(ext) ||
      REJECTED_EXTENSIONS.has(name) ||
      REJECTED_PREFIXES.some((p) => name.startsWith(p.toLowerCase())) ||
      file.size === 0;
    if (isJunk) rejected.push(file);
    else accepted.push(file);
  }
  return { accepted, rejected };
}

// ─── Document types the user can order ─────────────────────────────

const DOCUMENT_OPTIONS = [
  {
    type: JobType.TIMELINE,
    label: "Timeline",
    description: "Chronological list of events from your evidence",
    icon: Clock,
  },
  {
    type: JobType.RESEARCH,
    label: "Research Summary",
    description: "Legal research and analysis of the dispute",
    icon: Search,
  },
  {
    type: JobType.CLAIM_MATRIX,
    label: "Extract Claims",
    description: "Identify key claims from your evidence",
    icon: ListChecks,
  },
  {
    type: JobType.DRAFT_GENERATION,
    label: "Draft Document",
    description: "Generate a legal draft (runs research first if needed)",
    icon: FileSignature,
  },
  {
    type: JobType.OCR,
    label: "Scan for Text",
    description: "Extract text from scanned/image documents",
    icon: ScanLine,
  },
] as const;

// ─── Step indicator ────────────────────────────────────────────────

function StepIndicator({ step, done, active }: { step: number; done: boolean; active: boolean }) {
  if (done) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
        <CheckCircle2 className="h-4 w-4" />
      </span>
    );
  }
  if (active) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm ring-2 ring-primary/20">
        {step}
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
      {step}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────

export function ClerkIntakePage() {
  const { matterId } = useParams({ strict: false }) as { matterId: string };
  const { data: matter, isLoading: matterLoading } = useMatter(matterId);
  const { data: context, isLoading: ctxLoading } = useIntakeContext(matterId);
  const { data: evidence } = useEvidence(matterId);
  const { data: jobs } = useJobs(matterId);
  const updateCtx = useUpdateIntakeContext(matterId);
  const upload = useUploadFiles(matterId);
  const updateStatus = useUpdateMatterStatus(matterId);
  const queueJob = useQueueJob(matterId);

  const [disputeTemplate, setDisputeTemplate] = useState("");
  const [narrative, setNarrative] = useState("");
  const [contextInputs, setContextInputs] = useState<
    { key: string; value: string }[]
  >([{ key: "Parties involved", value: "" }]);
  const [ctxInitialized, setCtxInitialized] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [ctxSaved, setCtxSaved] = useState(false);

  // Sync from server once
  if (context && !ctxInitialized) {
    setDisputeTemplate(context.dispute_template ?? "");
    setNarrative(context.narrative ?? "");
    const entries = Object.entries(context.context_inputs ?? {});
    setContextInputs(
      entries.length > 0
        ? entries.map(([key, value]) => ({ key, value: String(value ?? "") }))
        : [{ key: "Parties involved", value: "" }]
    );
    setCtxInitialized(true);
  }

  const onDrop = useCallback(
    (files: File[]) => {
      const { accepted, rejected } = filterFiles(files);
      setRejectedFiles(rejected);
      if (accepted.length > 0) upload.mutate(accepted);
    },
    [upload]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noDragEventsBubbling: true,
  });

  if (matterLoading || ctxLoading) return <LoadingSpinner />;
  if (!matter) return <ErrorDisplay error={new Error("Matter not found")} />;

  const handleSaveContext = () => {
    const inputs: Record<string, string> = {};
    for (const { key, value } of contextInputs) {
      const k = key.trim();
      if (k) inputs[k] = value.trim();
    }
    setCtxSaved(false);
    updateCtx.mutate(
      {
        dispute_template: disputeTemplate || null,
        narrative: narrative || null,
        context_inputs: Object.keys(inputs).length > 0 ? inputs : undefined,
      },
      {
        onSuccess: () => setCtxSaved(true),
      }
    );
  };

  const handleTransition = () => {
    updateStatus.mutate({ status: MatterStatus.UNDER_REVIEW });
  };

  const hasEvidence = !!(evidence && evidence.length > 0);
  const intakeReady = context?.gate_passed === true;
  const canOrder = hasEvidence && intakeReady;
  const hasSucceededJob = (jobs ?? []).some((j) => j.status === JobStatus.SUCCEEDED);

  // Step completion
  const step1Done = hasEvidence;
  const step2Done = intakeReady;
  const step3Done = hasSucceededJob;

  // Check which job types are already queued/running
  const activeJobTypes = new Set(
    (jobs ?? [])
      .filter((j) => j.status === JobStatus.QUEUED || j.status === JobStatus.RUNNING)
      .map((j) => j.job_type)
  );

  const handleOrder = (jobType: JobType) => {
    queueJob.mutate({ job_type: jobType });
  };

  // Files to display inline (first 5 or all)
  const filesToShow = showAllFiles ? evidence ?? [] : (evidence ?? []).slice(0, 5);
  const hasMoreFiles = (evidence?.length ?? 0) > 5;

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Header */}
        <Link
          to="/clerk"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to matters
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{matter.name}</h1>
            <p className="text-sm text-muted-foreground">
              {matter.client_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={matter.status} />
            {matter.status === MatterStatus.INTAKE && intakeReady && (
              <Button
                size="sm"
                onClick={handleTransition}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending
                  ? "Submitting..."
                  : "Submit for Review"}
              </Button>
            )}
            {updateStatus.error && (
              <span className="text-xs text-destructive">{updateStatus.error.message}</span>
            )}
          </div>
        </div>

        {/* ── Step 1: Upload Files ──────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <StepIndicator step={1} done={step1Done} active={!step1Done} />
              Upload Evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <FolderUp className="mb-2 h-6 w-6 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-sm">Drop files or folders here...</p>
              ) : (
                <div className="text-center">
                  <p className="text-sm">Drag & drop, or</p>
                  <div className="mt-2 flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openFileDialog}
                    >
                      Browse Files
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.webkitdirectory = true;
                        input.multiple = true;
                        input.onchange = () => {
                          if (input.files) onDrop(Array.from(input.files));
                        };
                        input.click();
                      }}
                    >
                      <FolderUp className="h-4 w-4" />
                      Browse Folder
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {upload.isPending && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <LoadingSpinner className="h-4 w-4" />
                Uploading...
              </div>
            )}
            {upload.data && (
              <div className="mt-3 text-sm">
                <Badge variant="secondary">
                  {upload.data.files_added} files added,{" "}
                  {upload.data.files_skipped} skipped
                </Badge>
              </div>
            )}
            {upload.error && (
              <p className="mt-3 text-sm text-destructive">
                {upload.error.message}
              </p>
            )}
            {rejectedFiles.length > 0 && (
              <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm">
                <p className="font-medium text-yellow-800">
                  {rejectedFiles.length} file
                  {rejectedFiles.length > 1 ? "s" : ""} filtered out
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {rejectedFiles
                    .slice(0, 5)
                    .map((f) => f.name)
                    .join(", ")}
                  {rejectedFiles.length > 5 &&
                    ` and ${rejectedFiles.length - 5} more`}
                </p>
              </div>
            )}
            {/* Inline file list */}
            {hasEvidence && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50/50 p-3 space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-medium text-green-700 mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {evidence.length} file{evidence.length > 1 ? "s" : ""} uploaded
                </p>
                {filesToShow.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-green-100/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-green-600" />
                      <span className="truncate text-xs">{e.original_name}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {e.size_bytes < 1024
                        ? `${e.size_bytes} B`
                        : e.size_bytes < 1048576
                          ? `${(e.size_bytes / 1024).toFixed(0)} KB`
                          : `${(e.size_bytes / 1048576).toFixed(1)} MB`}
                    </span>
                  </div>
                ))}
                {hasMoreFiles && (
                  <button
                    type="button"
                    onClick={() => setShowAllFiles(!showAllFiles)}
                    className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 pt-1"
                  >
                    {showAllFiles ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        Show all {evidence.length} files
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Step 2: Describe the Dispute ──────────────────────── */}
        <Card id="step-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <StepIndicator step={2} done={step2Done} active={step1Done && !step2Done} />
              Describe the Dispute
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                Dispute Type <span className="text-destructive">*</span>
              </Label>
              <Input
                value={disputeTemplate}
                onChange={(e) => setDisputeTemplate(e.target.value)}
                placeholder="e.g. Breach of Contract, Debt Recovery, Employment"
              />
            </div>
            <div className="space-y-2">
              <Label>
                What happened? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Describe the dispute in plain language — who did what, when, and what's the issue..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Details (optional but helpful)</Label>
              <p className="text-xs text-muted-foreground">
                Add any relevant facts: parties, dates, amounts, jurisdiction
              </p>
              <div className="space-y-2">
                {contextInputs.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={entry.key}
                      onChange={(e) => {
                        const next = contextInputs.map((item, j) =>
                          j === i
                            ? { key: e.target.value, value: item.value }
                            : item
                        );
                        setContextInputs(next);
                      }}
                      placeholder="e.g. Parties involved, Jurisdiction, Amount"
                      className="w-2/5"
                    />
                    <Input
                      value={entry.value}
                      onChange={(e) => {
                        const next = contextInputs.map((item, j) =>
                          j === i
                            ? { key: item.key, value: e.target.value }
                            : item
                        );
                        setContextInputs(next);
                      }}
                      placeholder="Value"
                      className="flex-1"
                    />
                    {contextInputs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() =>
                          setContextInputs(
                            contextInputs.filter((_, j) => j !== i)
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setContextInputs([
                      ...contextInputs,
                      { key: "", value: "" },
                    ])
                  }
                >
                  <Plus className="h-3 w-3" />
                  Add Detail
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveContext}
                disabled={updateCtx.isPending}
              >
                {updateCtx.isPending ? "Saving..." : "Save"}
              </Button>
              {ctxSaved && !updateCtx.isPending && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Details saved — you can now order documents
                </span>
              )}
            </div>
            {updateCtx.error && (
              <p className="text-sm text-destructive">
                {updateCtx.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Step 3: Order Documents ───────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <StepIndicator step={3} done={step3Done} active={canOrder && !step3Done} />
              Order Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!canOrder && (
              <div className="flex items-start gap-2 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 mb-4">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  {!hasEvidence ? (
                    "Upload at least one evidence file in Step 1 first."
                  ) : (
                    <>
                      Save your dispute details in{" "}
                      <a href="#step-2" className="underline font-medium">
                        Step 2
                      </a>{" "}
                      first.
                    </>
                  )}
                </p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {DOCUMENT_OPTIONS.map((doc) => {
                const isActive = activeJobTypes.has(doc.type);
                const succeeded = (jobs ?? []).some(
                  (j) =>
                    j.job_type === doc.type &&
                    j.status === JobStatus.SUCCEEDED
                );
                return (
                  <button
                    key={doc.type}
                    disabled={!canOrder || isActive}
                    onClick={() => handleOrder(doc.type)}
                    className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <doc.icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {doc.label}
                        </span>
                        {isActive && (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        )}
                        {succeeded && (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {queueJob.error && (
              <p className="mt-3 text-sm text-destructive">
                {queueJob.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Jobs Tracker ──────────────────────────────────────── */}
        {jobs && jobs.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Loader2 className="h-5 w-5" />
                Processing ({jobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[250px]">
                <div className="space-y-2">
                  {[...jobs].reverse().map((j) => (
                    <div
                      key={j.id}
                      className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <JobStatusIcon status={j.status} />
                        <span className="font-medium">
                          {formatLabel(j.job_type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            j.status === JobStatus.SUCCEEDED
                              ? "secondary"
                              : j.status === JobStatus.FAILED
                                ? "destructive"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {formatLabel(j.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelative(j.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function JobStatusIcon({ status }: { status: string }) {
  switch (status) {
    case JobStatus.SUCCEEDED:
      return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
    case JobStatus.FAILED:
      return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
    case JobStatus.RUNNING:
      return <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}
