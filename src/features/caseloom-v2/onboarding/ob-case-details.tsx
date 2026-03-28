import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";
import { ObComboBox } from "./ob-combo-box";

const CASE_TYPE_SUGGESTIONS = [
  // Civil
  "Contract Dispute",
  "Property & Real Estate",
  "Landlord-Tenant",
  "Consumer Protection",
  "Recovery of Money / Debt",
  "Partnership & Joint Venture",
  "Insurance Claim",
  // Commercial
  "Company & Shareholder Dispute",
  "Banking & Finance",
  "Insolvency & Bankruptcy",
  "IP / Patent / Trademark",
  "Tax Dispute",
  "Securities & Capital Markets",
  // Employment
  "Employment Dispute",
  "Industrial & Labour",
  "Sexual Harassment (POSH)",
  // Family
  "Divorce & Matrimonial",
  "Child Custody & Guardianship",
  "Succession & Inheritance",
  "Domestic Violence",
  // Criminal & Regulatory
  "Criminal Defence",
  "White Collar / Economic Offences",
  "Environmental",
  "Regulatory & Compliance",
  "Anti-Corruption (PCA)",
  // Personal & Tort
  "Personal Injury",
  "Medical Negligence",
  "Motor Accident Claim",
  "Defamation",
  // Constitutional & Public
  "Writ Petition",
  "Public Interest Litigation",
  "Land Acquisition",
  // ADR
  "Arbitration (Domestic)",
  "Arbitration (International)",
];

const QA_FIELDS = [
  {
    id: "case_type",
    q: "What type of case is this?",
    type: "combo" as const,
    required: true,
    opts: CASE_TYPE_SUGGESTIONS,
    ph: "Search or type your own...",
  },
  {
    id: "jurisdiction",
    q: "What jurisdiction?",
    type: "combo" as const,
    required: true,
    opts: [
      "India",
      "England & Wales",
      "Scotland",
      "California",
      "New York",
      "Texas",
      "Federal (US)",
      "EU",
      "Australia",
      "Singapore",
      "UAE / DIFC",
      "Hong Kong",
    ],
    ph: "Search or type your own...",
  },
  {
    id: "client_name",
    q: "Client's full legal name?",
    type: "text" as const,
    required: true,
    ph: "e.g. Sarah Chen",
  },
  {
    id: "opposing",
    q: "Opposing party name?",
    type: "text" as const,
    required: true,
    ph: "e.g. Torres Holdings Ltd",
  },
  {
    id: "filing_date",
    q: "Intended filing date (if known)?",
    type: "date" as const,
    required: false,
  },
  {
    id: "urgency",
    q: "Priority level?",
    type: "select" as const,
    required: false,
    opts: ["Standard", "Urgent", "Critical \u2014 Court deadline"],
  },
];

export function ObCaseDetails() {
  const obQa = useCaseLoomV2Store((s) => s.obQa);
  const updateObQa = useCaseLoomV2Store((s) => s.updateObQa);

  const allRequired =
    obQa.case_type && obQa.jurisdiction && obQa.client_name && obQa.opposing;

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
            {q.type === "combo" ? (
              <ObComboBox
                value={
                  (obQa[q.id as keyof typeof obQa] as string | undefined) ?? ""
                }
                onChange={(v) => updateObQa(q.id, v)}
                suggestions={q.opts ?? []}
                placeholder={q.ph ?? "Select or type..."}
                style={inputStyle}
              />
            ) : q.type === "select" ? (
              <select
                value={
                  (obQa[q.id as keyof typeof obQa] as string | undefined) ??
                  ""
                }
                onChange={(e) => updateObQa(q.id, e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: "none",
                  WebkitAppearance: "none",
                  color: obQa[q.id as keyof typeof obQa]
                    ? "var(--cl-bright)"
                    : "var(--cl-dim)",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6F7B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
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
