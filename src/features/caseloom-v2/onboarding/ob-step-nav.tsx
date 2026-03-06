import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";

const OB_STEPS = ["Start", "Upload", "Processing", "Case Details", "Review", "Done"];

export function ObStepNav() {
  const obStep = useCaseLoomV2Store((s) => s.obStep);

  return (
    <div className="ml-4 flex items-center gap-0.5">
      {OB_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-0.5">
          <div
            className="flex items-center gap-1 rounded-md px-2 py-0.5"
            style={{
              background:
                i === obStep
                  ? "color-mix(in srgb, var(--cl-gold) 9%, transparent)"
                  : "transparent",
              border:
                i === obStep
                  ? "1px solid color-mix(in srgb, var(--cl-gold) 27%, transparent)"
                  : "1px solid transparent",
            }}
          >
            <div
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold"
              style={{
                background:
                  i < obStep
                    ? "color-mix(in srgb, var(--cl-green) 13%, transparent)"
                    : i === obStep
                      ? "color-mix(in srgb, var(--cl-gold) 20%, transparent)"
                      : "color-mix(in srgb, var(--cl-dim) 13%, transparent)",
                color:
                  i < obStep
                    ? "var(--cl-green)"
                    : i === obStep
                      ? "var(--cl-gold)"
                      : "var(--cl-dim)",
              }}
            >
              {i < obStep ? "\u2713" : i + 1}
            </div>
            <span
              className="whitespace-nowrap text-[9px]"
              style={{
                fontWeight: i === obStep ? 600 : 400,
                color:
                  i === obStep
                    ? "var(--cl-gold)"
                    : i < obStep
                      ? "var(--cl-muted)"
                      : "var(--cl-dim)",
              }}
            >
              {s}
            </span>
          </div>
          {i < OB_STEPS.length - 1 && (
            <div
              className="h-px w-2"
              style={{
                background:
                  i < obStep
                    ? "color-mix(in srgb, var(--cl-green) 27%, transparent)"
                    : "color-mix(in srgb, var(--cl-dim) 20%, transparent)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
