import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";

interface ObDoneProps {
  onViewDashboard: () => void;
  onOpenIDE: () => void;
}

export function ObDone({ onViewDashboard, onOpenIDE }: ObDoneProps) {
  const obQa = useCaseLoomV2Store((s) => s.obQa);

  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="max-w-[460px] text-center">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] text-[28px]"
          style={{
            background:
              "color-mix(in srgb, var(--cl-green) 13%, transparent)",
            color: "var(--cl-green)",
          }}
        >
          {"\u2713"}
        </div>
        <h2
          className="mb-2.5 text-[26px] font-extrabold"
          style={{ color: "var(--cl-bright)" }}
        >
          Case Ready
        </h2>
        <p
          className="mx-auto mb-7 max-w-[400px] text-[13px] leading-relaxed"
          style={{ color: "var(--cl-muted)" }}
        >
          {obQa.client_name || "Your client"} v.{" "}
          {obQa.opposing || "the opposing party"} has been created, organised,
          and is ready in your dashboard. Open it in the IDE to start building
          your case file.
        </p>
        <div className="flex justify-center gap-2.5">
          <button
            onClick={onViewDashboard}
            className="cursor-pointer rounded-[9px] px-5 py-2.5 text-[13px] font-bold"
            style={{
              background: "var(--cl-surface)",
              border: "1px solid var(--cl-border)",
              color: "var(--cl-muted)",
              fontFamily: "inherit",
            }}
          >
            View Dashboard
          </button>
          <button
            onClick={onOpenIDE}
            className="cursor-pointer rounded-[9px] px-5 py-2.5 text-[13px] font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
              border: "none",
              color: "var(--cl-bg)",
              fontFamily: "inherit",
            }}
          >
            Open in IDE {"\u2192"}
          </button>
        </div>
      </div>
    </div>
  );
}
