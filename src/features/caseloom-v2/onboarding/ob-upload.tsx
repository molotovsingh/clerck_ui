import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function fileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["zip", "tar", "gz", "rar"].includes(ext)) return "\u229E"; // ⊞
  if (["pdf"].includes(ext)) return "\u25E7"; // ◧
  if (["docx", "doc"].includes(ext)) return "\u25EB"; // ◫
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "\u25A3"; // ▣
  return "\u2261"; // ≡
}

export function ObUpload() {
  const obFiles = useCaseLoomV2Store((s) => s.obFiles);
  const setObFiles = useCaseLoomV2Store((s) => s.setObFiles);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setObFiles([...obFiles, ...accepted]);
    },
    [obFiles, setObFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
  });

  const browseFolder = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.multiple = true;
    input.onchange = () => {
      if (input.files) onDrop(Array.from(input.files));
    };
    input.click();
  };

  const hasFiles = obFiles.length > 0;

  return (
    <div className="mx-auto max-w-[640px] px-5 py-9">
      <h2
        className="mb-1 text-[22px] font-extrabold"
        style={{ color: "var(--cl-bright)" }}
      >
        Upload Client Files
      </h2>
      <p className="mb-6 text-[13px]" style={{ color: "var(--cl-muted)" }}>
        Drop everything you've got — the messier the better. AI will sort it.
      </p>

      <div
        {...getRootProps()}
        className="mb-4 cursor-pointer rounded-xl p-9 text-center transition-all"
        style={{
          border: hasFiles
            ? "2px dashed color-mix(in srgb, var(--cl-green) 40%, transparent)"
            : isDragActive
              ? "2px dashed var(--cl-gold)"
              : "2px dashed var(--cl-border)",
          background: hasFiles
            ? "color-mix(in srgb, var(--cl-green) 2%, transparent)"
            : isDragActive
              ? "color-mix(in srgb, var(--cl-gold) 5%, transparent)"
              : "transparent",
        }}
      >
        <input {...getInputProps()} />
        <div
          className="mb-2 text-4xl"
          style={{
            color: hasFiles ? "var(--cl-green)" : "var(--cl-dim)",
          }}
        >
          {hasFiles ? "\u2713" : "\u2191"}
        </div>
        <div
          className="text-sm font-semibold"
          style={{
            color: hasFiles ? "var(--cl-green)" : "var(--cl-muted)",
          }}
        >
          {hasFiles
            ? `${obFiles.length} file${obFiles.length !== 1 ? "s" : ""} ready`
            : isDragActive
              ? "Drop files here..."
              : "Drag & drop files or folders here"}
        </div>
        {!isDragActive && (
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openFileDialog(); }}
              className="cursor-pointer rounded-lg px-4 py-2 text-[12px] font-semibold"
              style={{
                background: "var(--cl-surface)",
                border: "1px solid var(--cl-border)",
                color: "var(--cl-muted)",
                fontFamily: "inherit",
              }}
            >
              Browse Files
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); browseFolder(); }}
              className="cursor-pointer rounded-lg px-4 py-2 text-[12px] font-semibold"
              style={{
                background: "var(--cl-surface)",
                border: "1px solid var(--cl-border)",
                color: "var(--cl-muted)",
                fontFamily: "inherit",
              }}
            >
              Browse Folder
            </button>
          </div>
        )}
        <div className="mt-2 text-xs" style={{ color: "var(--cl-dim)" }}>
          PDF, DOCX, TXT, JPG, ZIP, MP3 — anything
        </div>
      </div>

      {hasFiles && (
        <div className="flex flex-col gap-1">
          {obFiles.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 rounded-lg px-3.5 py-2.5"
              style={{
                background: "var(--cl-surface)",
                border: "1px solid var(--cl-border)",
                animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
              }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[13px]"
                style={{
                  background:
                    "color-mix(in srgb, var(--cl-dim) 13%, transparent)",
                  color: "var(--cl-dim)",
                }}
              >
                {fileIcon(f.name)}
              </span>
              <div className="flex-1">
                <div
                  className="text-xs font-medium"
                  style={{ color: "var(--cl-bright)" }}
                >
                  {f.name}
                </div>
                <div className="text-[10px]" style={{ color: "var(--cl-dim)" }}>
                  {formatBytes(f.size)}
                </div>
              </div>
              <span
                className="inline-block rounded-[10px] px-[7px] py-[2px] text-[9px] font-bold"
                style={{
                  color: "var(--cl-green)",
                  background:
                    "color-mix(in srgb, var(--cl-green) 13%, transparent)",
                }}
              >
                Ready
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
