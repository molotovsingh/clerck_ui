import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMatters } from "@/hooks/use-matters";
import { StatusBadge } from "@/components/common/status-badge";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Briefcase,
  ClipboardList,
  Terminal,
  Plus,
  Scale,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: matters } = useMatters();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navigate = (to: string, params?: Record<string, string>) => {
    setOpen(false);
    router.navigate({ to, params });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search matters, navigate, or run an action..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {matters && matters.length > 0 && (
          <CommandGroup heading="Matters">
            {matters.map((m) => (
              <CommandItem
                key={m.public_id}
                value={`${m.name} ${m.client_name}`}
                onSelect={() =>
                  navigate("/matters/$matterId", { matterId: m.public_id })
                }
              >
                <Scale className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="truncate">{m.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {m.client_name}
                  </span>
                </div>
                <StatusBadge status={m.status} />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem
            value="Go to Matters"
            onSelect={() => navigate("/matters")}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Matters</span>
          </CommandItem>
          <CommandItem
            value="Go to Lawyer Workspace"
            onSelect={() => navigate("/matters")}
          >
            <Briefcase className="h-4 w-4" />
            <span>Lawyer Workspace</span>
          </CommandItem>
          <CommandItem
            value="Go to Dev Console"
            onSelect={() => navigate("/dev")}
          >
            <Terminal className="h-4 w-4" />
            <span>Dev Console</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="Create New Matter"
            onSelect={() => navigate("/matters")}
          >
            <Plus className="h-4 w-4" />
            <span>Create New Matter</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
