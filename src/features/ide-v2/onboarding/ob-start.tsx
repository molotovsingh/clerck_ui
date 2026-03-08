export function ObStart() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="max-w-[500px] text-center">
        <div
          className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[18px] text-[28px] font-extrabold"
          style={{
            background:
              "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
            color: "var(--cl-bg)",
          }}
        >
          CL
        </div>
        <h1
          className="mb-2.5 text-[28px] font-extrabold tracking-tight"
          style={{ color: "var(--cl-bright)" }}
        >
          Start a New Case
        </h1>
        <p
          className="mx-auto mb-7 max-w-[400px] text-sm leading-relaxed"
          style={{ color: "var(--cl-muted)" }}
        >
          Upload your client's files — documents, emails, photos, anything.
          <br />
          CaseLoom organises everything and builds your timeline.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Dump any files",
            "AI sorts them",
            "Answer key Qs",
            "Get timeline",
            "Edit with AI",
            "MECE case file",
          ].map((t, i) => (
            <div
              key={i}
              className="rounded-[20px] px-3 py-[7px] text-[11px]"
              style={{
                color: "var(--cl-muted)",
                background: "var(--cl-surface)",
                border: "1px solid var(--cl-border)",
              }}
            >
              <span
                className="mr-1 font-bold"
                style={{ color: "var(--cl-gold)" }}
              >
                {i + 1}
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
