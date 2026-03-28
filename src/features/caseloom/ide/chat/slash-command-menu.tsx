import { useState, useEffect } from "react";
import { matchSlashCommands, type SlashCommandDef } from "./slash-commands";
import { formatLabel } from "@/lib/format-label";

interface SlashCommandMenuProps {
  input: string;
  onSelect: (text: string) => void;
  visible: boolean;
}

export function SlashCommandMenu({
  input,
  onSelect,
  visible,
}: SlashCommandMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = visible ? matchSlashCommands(input) : [];

  // Find the command being typed to check if we should show doc_type sub-options
  const parts = input.trim().split(/\s+/);
  const typedCmd = parts[0]?.toLowerCase() ?? "";
  const matchedCmd = matches.length === 1 ? matches[0] : null;
  const showDocTypes =
    matchedCmd?.needsDocType &&
    matchedCmd.command === typedCmd &&
    parts.length <= 2;

  useEffect(() => {
    setActiveIndex(0);
  }, [input]);

  if (!visible || (matches.length === 0 && !showDocTypes)) return null;

  // If the command is fully typed and needs a doc_type, show sub-options
  if (showDocTypes && matchedCmd?.docTypeOptions) {
    const typedArg = parts[1]?.toLowerCase() ?? "";
    const docOpts = matchedCmd.docTypeOptions.filter((o) =>
      o.startsWith(typedArg)
    );
    if (docOpts.length === 0) return null;

    return (
      <div
        className="absolute bottom-full left-0 right-0 mb-1 max-h-[180px] overflow-y-auto rounded-lg py-1"
        style={{
          background: "var(--cl-surface)",
          border: "1px solid var(--cl-border-hi)",
          zIndex: 50,
        }}
      >
        {docOpts.map((opt, i) => (
          <button
            key={opt}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs"
            style={{
              background:
                i === activeIndex
                  ? "color-mix(in srgb, var(--cl-gold) 12%, transparent)"
                  : "transparent",
              color: "var(--cl-bright)",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(`${matchedCmd.command} ${opt}`);
            }}
            onMouseEnter={() => setActiveIndex(i)}
          >
            <span style={{ color: "var(--cl-gold)" }}>
              {matchedCmd.command}
            </span>
            <span>{formatLabel(opt)}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-1 max-h-[180px] overflow-y-auto rounded-lg py-1"
      style={{
        background: "var(--cl-surface)",
        border: "1px solid var(--cl-border-hi)",
        zIndex: 50,
      }}
    >
      {matches.map((cmd, i) => (
        <button
          key={cmd.command}
          className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs"
          style={{
            background:
              i === activeIndex
                ? "color-mix(in srgb, var(--cl-gold) 12%, transparent)"
                : "transparent",
            color: "var(--cl-bright)",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd.command + (cmd.needsDocType ? " " : ""));
          }}
          onMouseEnter={() => setActiveIndex(i)}
        >
          <span>
            <span className="font-semibold" style={{ color: "var(--cl-gold)" }}>
              {cmd.command}
            </span>
            {cmd.needsDocType && (
              <span style={{ color: "var(--cl-dim)" }}> &lt;doc_type&gt;</span>
            )}
          </span>
          <span style={{ color: "var(--cl-muted)" }}>{cmd.description}</span>
        </button>
      ))}
    </div>
  );

  // Keyboard navigation is handled by the parent via onKeyDown
}

/**
 * Handle keyboard navigation for the slash command menu.
 * Returns true if the key was consumed.
 */
export function handleSlashMenuKey(
  e: React.KeyboardEvent,
  input: string,
  activeIndex: number,
  setActiveIndex: (i: number) => void,
  matches: SlashCommandDef[],
  onSelect: (text: string) => void
): boolean {
  if (matches.length === 0) return false;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActiveIndex(Math.min(activeIndex + 1, matches.length - 1));
    return true;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    setActiveIndex(Math.max(activeIndex - 1, 0));
    return true;
  }
  if (e.key === "Tab" || (e.key === "Enter" && input.endsWith("/"))) {
    e.preventDefault();
    const cmd = matches[activeIndex];
    if (cmd) onSelect(cmd.command + (cmd.needsDocType ? " " : ""));
    return true;
  }
  return false;
}
