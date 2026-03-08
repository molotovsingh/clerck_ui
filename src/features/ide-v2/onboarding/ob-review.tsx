function Pill({ color, text }: { color: string; text: string }) {
  return (
    <span
      className="inline-block rounded-[10px] px-[7px] py-[2px] text-[9px] font-bold"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 13%, transparent)`,
      }}
    >
      {text}
    </span>
  );
}

const GROUPS = [
  {
    label: "Sources \u2014 traced to inbox",
    color: "var(--cl-blue)",
    items: [
      "Contracts/ (2 files)",
      "Correspondence/ (3 files)",
      "Evidence/ (3 files)",
      "Financial/ (2 files)",
    ],
  },
  {
    label: "Working Files \u2014 AI generated",
    color: "var(--cl-purple)",
    items: ["ai_summary.md", "interview_transcript.txt"],
  },
];

export function ObReview() {
  return (
    <div className="mx-auto max-w-[620px] px-5 py-9">
      <h2
        className="mb-1 text-[22px] font-extrabold"
        style={{ color: "var(--cl-bright)" }}
      >
        Middlebox Preview
      </h2>
      <p className="mb-6 text-[13px]" style={{ color: "var(--cl-muted)" }}>
        AI has organised your uploads. This is how your Middlebox will look.
      </p>

      {GROUPS.map((group) => (
        <div key={group.label} className="mb-4">
          <div
            className="mb-2 text-[9px] font-bold uppercase tracking-widest"
            style={{ color: group.color }}
          >
            {group.label}
          </div>
          <div
            className="overflow-hidden rounded-[10px]"
            style={{
              background: "var(--cl-surface)",
              border: "1px solid var(--cl-border)",
            }}
          >
            {group.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3.5 py-2.5"
                style={{
                  borderBottom:
                    i < group.items.length - 1
                      ? "1px solid var(--cl-border)"
                      : "none",
                }}
              >
                <span
                  className="text-xs"
                  style={{ color: group.color }}
                >
                  {"\u2514"}
                </span>
                <span
                  className="flex-1 text-xs"
                  style={{ color: "var(--cl-text)" }}
                >
                  {item}
                </span>
                <Pill color="var(--cl-gold)" text="from inbox" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div
        className="rounded-[10px] p-3.5"
        style={{
          background:
            "color-mix(in srgb, var(--cl-gold) 5%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--cl-gold) 20%, transparent)",
        }}
      >
        <div
          className="mb-1 text-xs font-bold"
          style={{ color: "var(--cl-gold)" }}
        >
          {"\u2713"} Ready to open in IDE
        </div>
        <div className="text-xs" style={{ color: "var(--cl-muted)" }}>
          Once you continue, the case will appear in your dashboard and you
          can open the full IDE workspace.
        </div>
      </div>
    </div>
  );
}
