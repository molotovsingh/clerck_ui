import { useEffect } from "react";
import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";

const AI_STEPS = [
  { label: "Scanning uploaded files", detail: "Detecting file types" },
  { label: "Extracting text content", detail: "OCR on scanned docs" },
  { label: "Identifying dates & events", detail: "Finding key dates" },
  { label: "Detecting party names", detail: "Identifying parties" },
  { label: "Categorising documents", detail: "Creating categories" },
  { label: "Cross-referencing sources", detail: "Building provenance map" },
  { label: "Generating draft timeline", detail: "Key events" },
  { label: "Flagging gaps & conflicts", detail: "Issues found" },
];

export function ObProcessing() {
  const obProcessingStep = useCaseLoomV2Store((s) => s.obProcessingStep);
  const setObProcessingStep = useCaseLoomV2Store((s) => s.setObProcessingStep);
  const obFiles = useCaseLoomV2Store((s) => s.obFiles);

  useEffect(() => {
    setObProcessingStep(-1);
    let step = 0;
    const iv = setInterval(() => {
      setObProcessingStep(step);
      step++;
      if (step >= AI_STEPS.length) clearInterval(iv);
    }, 500);
    return () => clearInterval(iv);
  }, [setObProcessingStep]);

  const allDone = obProcessingStep >= AI_STEPS.length - 1;

  return (
    <div className="mx-auto max-w-[560px] px-5 py-9">
      <h2
        className="mb-1 text-[22px] font-extrabold"
        style={{ color: "var(--cl-bright)" }}
      >
        AI is Organising Your Files
      </h2>
      <p className="mb-6 text-[13px]" style={{ color: "var(--cl-muted)" }}>
        Extracting, categorising, building your case structure...
      </p>

      <div className="flex flex-col gap-1.5">
        {AI_STEPS.map((s, i) => {
          const done = i <= obProcessingStep;
          const active = i === obProcessingStep;
          return (
            <div
              key={i}
              className="flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 transition-all"
              style={{
                background: active
                  ? "color-mix(in srgb, var(--cl-gold) 6%, transparent)"
                  : done
                    ? "var(--cl-surface)"
                    : "transparent",
                border: active
                  ? "1px solid color-mix(in srgb, var(--cl-gold) 20%, transparent)"
                  : done
                    ? "1px solid var(--cl-border)"
                    : "1px solid transparent",
              }}
            >
              <div
                className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all"
                style={{
                  background:
                    done && !active
                      ? "color-mix(in srgb, var(--cl-green) 13%, transparent)"
                      : active
                        ? "color-mix(in srgb, var(--cl-gold) 13%, transparent)"
                        : "color-mix(in srgb, var(--cl-dim) 9%, transparent)",
                  color:
                    done && !active
                      ? "var(--cl-green)"
                      : active
                        ? "var(--cl-gold)"
                        : "var(--cl-dim)",
                }}
              >
                {done && !active ? "\u2713" : active ? "\u27F3" : i + 1}
              </div>
              <div
                className="flex-1 text-xs transition-all"
                style={{
                  fontWeight: active ? 700 : 400,
                  color: done || active ? "var(--cl-bright)" : "var(--cl-dim)",
                }}
              >
                {s.label}
              </div>
              <span
                className="text-[10px] transition-all"
                style={{
                  color: "var(--cl-muted)",
                  opacity: done || active ? 1 : 0.3,
                }}
              >
                {s.detail}
              </span>
            </div>
          );
        })}
      </div>

      {allDone && (
        <div
          className="mt-4 flex gap-3 rounded-[10px] p-3.5"
          style={{
            background:
              "color-mix(in srgb, var(--cl-green) 6%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--cl-green) 20%, transparent)",
            animation: "fadeUp 0.4s ease",
          }}
        >
          <span className="text-lg" style={{ color: "var(--cl-green)" }}>
            {"\u2713"}
          </span>
          <div>
            <div
              className="text-[13px] font-bold"
              style={{ color: "var(--cl-green)" }}
            >
              Processing Complete
            </div>
            <div
              className="mt-0.5 text-[11px]"
              style={{ color: "var(--cl-muted)" }}
            >
              {obFiles.length} files organised
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
