import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useMatters, useCreateMatter } from "@/hooks/use-matters";
import { useAuthStore } from "@/stores/auth-store";
import { useMatterClassOptions } from "@/hooks/use-matter-class-options";
import { MatterStatus, Role } from "@/types/enums";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen, Plus, ChevronUp, Clock, ArrowRight } from "lucide-react";
import { formatLabel } from "@/lib/format-label";
import { formatRelative } from "@/lib/format-date";

type StatusFilter = "all" | "intake" | "under_review" | "approved" | "filed";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "intake", label: "Intake" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "filed", label: "Filed" },
];

const STATUS_MAP: Record<StatusFilter, MatterStatus | null> = {
  all: null,
  intake: MatterStatus.INTAKE,
  under_review: MatterStatus.UNDER_REVIEW,
  approved: MatterStatus.CLIENT_APPROVED,
  filed: MatterStatus.FILED,
};

export function MatterLauncher() {
  const role = useAuthStore((s) => s.role);
  const canCreate = role === Role.ADMIN || role === Role.RECORDS_OWNER;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Matters</h1>
        <p className="text-sm text-muted-foreground">
          {canCreate
            ? "Create a new matter or select one to open"
            : "Select a matter to open"}
        </p>
      </div>
      {canCreate && <InlineCreateMatter />}
      <MatterList />
    </div>
  );
}

function InlineCreateMatter() {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [matterClass, setMatterClass] = useState("general_dispute");
  const createMatter = useCreateMatter();
  const matterClasses = useMatterClassOptions();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createMatter.mutateAsync({
        name,
        client_name: clientName,
        matter_class: matterClass,
      });
      setName("");
      setClientName("");
      setExpanded(false);
      router.navigate({
        to: "/matters/$matterId",
        params: { matterId: result.public_id },
      });
    } catch {
      /* error displayed via createMatter.error */
    }
  };

  if (!expanded) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setExpanded(true)}
      >
        <Plus className="h-4 w-4" />
        New Matter
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">New Matter</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="matter-name" className="text-xs">Matter Name</Label>
              <Input
                id="matter-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smith v. Jones"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-name" className="text-xs">Client Name</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Matter Type</Label>
            <Select value={matterClass} onValueChange={setMatterClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {matterClasses.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {createMatter.error && (
            <p className="text-sm text-destructive">
              {createMatter.error.message}
            </p>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={createMatter.isPending}
          >
            {createMatter.isPending ? "Creating..." : "Create Matter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MatterList() {
  const { data: matters, isLoading } = useMatters();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  if (isLoading) return <LoadingSpinner />;
  if (!matters?.length) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No matters yet"
        description="Create your first matter to get started"
      />
    );
  }

  const filtered = matters.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.client_name.toLowerCase().includes(q) ||
      m.public_id.includes(q);

    const targetStatus = STATUS_MAP[filter];
    const matchFilter = !targetStatus || m.status === targetStatus;

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search matters..."
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No matters match your search.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <Link
              key={m.public_id}
              to="/matters/$matterId"
              params={{ matterId: m.public_id }}
              className="group block rounded-lg border p-4 hover:border-primary/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{m.name}</p>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {m.client_name}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs font-normal">
                  {formatLabel(m.matter_class)}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelative(m.updated_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
