import { useEffect } from "react";
import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";
import { useMatterClassOptions } from "@/hooks/use-matter-class-options";

interface QAField {
  id: string;
  q: string;
  type: "text" | "date" | "select";
  required: boolean;
  ph?: string;
  opts?: string[];
}

const QA_FIELDS: QAField[] = [
  {
    id: "case_type",
    q: "What type of case is this?",
    type: "text",
    required: true,
    ph: "e.g. Contract dispute, personal injury, employment...",
  },
  {
    id: "jurisdiction",
    q: "What jurisdiction?",
    type: "text",
    required: true,
    ph: "e.g. England & Wales, California, Federal...",
  },
  {
    id: "client_name",
    q: "Client's full legal name?",
    type: "text",
    required: true,
    ph: "e.g. Sarah Chen",
  },
  {
    id: "opposing",
    q: "Opposing party name?",
    type: "text",
    required: true,
    ph: "e.g. Torres Holdings Ltd",
  },
  {
    id: "filing_date",
    q: "Intended filing date (if known)?",
    type: "date",
    required: false,
  },
  {
    id: "urgency",
    q: "Priority level?",
    type: "select",
    required: false,
    opts: ["Standard", "Urgent", "Critical \u2014 Court deadline"],
  },
];

export function ObCaseDetails() {
  const obQa = useCaseLoomV2Store((s) => s.obQa);
  const updateObQa = useCaseLoomV2Store((s) => s.updateObQa);
  const { suggestions, customSupported, defaultClass } =
    useMatterClassOptions();

  // Pre-fill matter_class from server default when user hasn't chosen yet
  useEffect(() => {
    if (!obQa.matter_class && defaultClass) {
      updateObQa("matter_class", defaultClass);
    }
  }, [defaultClass, obQa.matter_class, updateObQa]);

  const allRequired =
    obQa.case_type &&
    obQa.jurisdiction &&
    obQa.client_name &&
    obQa.opposing &&
    obQa.matter_class;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 13px",
    borderRadius: 8,
    background: "var(--cl-surface)",
    border: "1px solid var(--cl-border)",
    color: "var(--cl-bright)",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6F7B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
  };

  return (
    <div className="mx-auto max-w-[580px] px-5 py-9">
      <h2
        className="mb-1 text-[22px] font-extrabold"
        style={{ color: "var(--cl-bright)" }}
      >
        A Few Key Details
      </h2>
      <p className="mb-6 text-[13px]" style={{ color: "var(--cl-muted)" }}>
        AI couldn't extract these reliably. Starred fields are required.
      </p>

      <div className="flex flex-col gap-3.5">
        {/* Matter classification */}
        <div>
          <label
            className="mb-1.5 block text-[11px] font-semibold"
            style={{ color: "var(--cl-muted)" }}
          >
            Matter classification
            <span className="ml-1" style={{ color: "var(--cl-red)" }}>
              *
            </span>
          </label>
          {customSupported ? (
            <>
              <input
                type="text"
                list="matter-class-suggestions"
                placeholder="e.g. General dispute, debt recovery..."
                value={obQa.matter_class ?? ""}
                onChange={(e) => updateObQa("matter_class", e.target.value)}
                style={inputStyle}
              />
              <datalist id="matter-class-suggestions">
                {suggestions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </datalist>
            </>
          ) : (
            <select
              value={obQa.matter_class ?? ""}
              onChange={(e) => updateObQa("matter_class", e.target.value)}
              style={{
                ...selectStyle,
                color: obQa.matter_class
                  ? "var(--cl-bright)"
                  : "var(--cl-dim)",
              }}
            >
              <option value="">Select...</option>
              {suggestions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {QA_FIELDS.map((q) => (
          <div key={q.id}>
            <label
              className="mb-1.5 block text-[11px] font-semibold"
              style={{ color: "var(--cl-muted)" }}
            >
              {q.q}
              {q.required && (
                <span className="ml-1" style={{ color: "var(--cl-red)" }}>
                  *
                </span>
              )}
            </label>
            {q.type === "select" ? (
              <select
                value={
                  (obQa[q.id as keyof typeof obQa] as string | undefined) ??
                  ""
                }
                onChange={(e) => updateObQa(q.id, e.target.value)}
                style={{
                  ...selectStyle,
                  color: obQa[q.id as keyof typeof obQa]
                    ? "var(--cl-bright)"
                    : "var(--cl-dim)",
                }}
              >
                <option value="">Select...</option>
                {q.opts?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={q.type === "date" ? "date" : "text"}
                placeholder={q.ph ?? ""}
                value={
                  (obQa[q.id as keyof typeof obQa] as string | undefined) ??
                  ""
                }
                onChange={(e) => updateObQa(q.id, e.target.value)}
                style={inputStyle}
              />
            )}
          </div>
        ))}
      </div>

      {allRequired && (
        <div
          className="mt-4 rounded-[10px] p-3"
          style={{
            background:
              "color-mix(in srgb, var(--cl-green) 6%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--cl-green) 20%, transparent)",
            animation: "fadeUp 0.3s ease",
          }}
        >
          <div
            className="text-[11px] font-semibold"
            style={{ color: "var(--cl-green)" }}
          >
            {"\u2713"} Required fields complete
          </div>
          <div
            className="mt-0.5 text-[11px]"
            style={{ color: "var(--cl-muted)" }}
          >
            {obQa.client_name} v. {obQa.opposing} &middot; {obQa.case_type}{" "}
            &middot; {obQa.jurisdiction}
          </div>
        </div>
      )}
    </div>
  );
}
