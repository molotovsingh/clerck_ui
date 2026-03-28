import { JobType } from "@/types/enums";

export interface SlashCommandDef {
  command: string;
  description: string;
  jobType: JobType;
  /** If true, the next word after the command is used as doc_type in the payload */
  needsDocType?: boolean;
  docTypeOptions?: string[];
}

export const SLASH_COMMANDS: SlashCommandDef[] = [
  {
    command: "/generate",
    description: "Generate a draft document",
    jobType: JobType.DRAFT_GENERATION,
    needsDocType: true,
    docTypeOptions: ["demand_letter", "chronology_memo", "exhibit_index"],
  },
  {
    command: "/research",
    description: "Run legal research for this matter",
    jobType: JobType.RESEARCH,
  },
  {
    command: "/validate",
    description: "Run validation checks on drafts",
    jobType: JobType.VALIDATION,
  },
  {
    command: "/ocr",
    description: "Extract text from uploaded evidence",
    jobType: JobType.OCR,
  },
  {
    command: "/timeline",
    description: "Build a chronological timeline from evidence",
    jobType: JobType.TIMELINE,
  },
  {
    command: "/claims",
    description: "Extract claims from evidence",
    jobType: JobType.CLAIM_MATRIX,
  },
];

export interface ParsedSlashCommand {
  def: SlashCommandDef;
  args: string[];
}

/**
 * Parse user input into a slash command + args.
 * Returns null if the input isn't a valid slash command.
 */
export function parseSlashCommand(input: string): ParsedSlashCommand | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0]!.toLowerCase();
  const args = parts.slice(1);

  const def = SLASH_COMMANDS.find((c) => c.command === cmd);
  if (!def) return null;

  return { def, args };
}

/**
 * Filter commands matching a partial input (for autocomplete).
 * e.g. "/gen" matches "/generate", "/val" matches "/validate"
 */
export function matchSlashCommands(partial: string): SlashCommandDef[] {
  const lower = partial.toLowerCase().trim();
  if (!lower.startsWith("/")) return [];

  // If it's just "/", show all commands
  if (lower === "/") return SLASH_COMMANDS;

  const cmdPart = lower.split(/\s/)[0]!;
  return SLASH_COMMANDS.filter((c) => c.command.startsWith(cmdPart));
}

/**
 * Build a job payload from a parsed slash command.
 */
export function buildJobPayload(
  parsed: ParsedSlashCommand
): Record<string, unknown> | undefined {
  if (parsed.def.needsDocType && parsed.args.length > 0) {
    return { doc_type: parsed.args[0] };
  }
  return undefined;
}
