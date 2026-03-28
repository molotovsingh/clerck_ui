import { useState, useRef, useEffect } from "react";

interface ObComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  style?: React.CSSProperties;
}

export function ObComboBox({
  value,
  onChange,
  suggestions,
  placeholder,
  style,
}: ObComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search with external value
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearch(v);
    onChange(v);
    setOpen(true);
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setSearch(item);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
    if (e.key === "Enter" && open && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[0]!);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={style}
      />
      {open && (search.length > 0 || filtered.length > 0) && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[200px] overflow-y-auto rounded-lg py-1"
          style={{
            background: "var(--cl-surface)",
            border: "1px solid var(--cl-border-hi)",
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className="flex w-full items-center px-3 py-1.5 text-left text-[12px]"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--cl-bright)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background =
                    "color-mix(in srgb, var(--cl-gold) 10%, transparent)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "transparent";
                }}
              >
                {item}
              </button>
            ))
          ) : (
            <div
              className="px-3 py-2 text-[11px]"
              style={{ color: "var(--cl-dim)" }}
            >
              No matches — your custom entry will be used
            </div>
          )}
        </div>
      )}
    </div>
  );
}
