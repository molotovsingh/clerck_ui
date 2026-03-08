import { useState, useCallback } from "react";
import { useUploadFiles } from "@/hooks/use-intake";
import { useEvidence } from "@/hooks/use-evidence";
import { useDropzone } from "react-dropzone";
import { filterFiles } from "./file-filter";
import { StepIndicator } from "./step-indicator";
import { HelpTip } from "@/components/common/help-tip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle2,
  FolderUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  matterId: string;
  stepDone: boolean;
}

export function UploadCard({ matterId, stepDone }: Props) {
  const { data: evidence } = useEvidence(matterId);
  const upload = useUploadFiles(matterId);
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const onDrop = useCallback(
    (files: File[]) => {
      const { accepted, rejected } = filterFiles(files);
      setRejectedFiles(rejected);
      if (accepted.length > 0) {
        upload.mutate(accepted, {
          onSuccess: (data) =>
            toast.success(`${data.files_added} file${data.files_added !== 1 ? "s" : ""} uploaded`),
        });
      }
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

  const hasEvidence = !!(evidence && evidence.length > 0);
  const filesToShow = showAllFiles ? evidence ?? [] : (evidence ?? []).slice(0, 5);
  const hasMoreFiles = (evidence?.length ?? 0) > 5;

  return (
    <Card id="step-1">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <StepIndicator step={1} done={stepDone} active={!stepDone} />
          Upload Evidence
          <HelpTip content="Upload documents, images, or scanned files as evidence. Supported: PDF, Word, images." />
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
  );
}
