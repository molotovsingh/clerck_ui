import { useState } from "react";
import { useMatters, useCreateMatter } from "@/hooks/use-matters";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { ErrorDisplay } from "@/components/common/error-display";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format-date";
import { formatLabel } from "@/lib/format-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FolderOpen } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";

const ALLOWED_MATTER_CLASSES = [
  { value: "general_dispute", label: "General Dispute" },
  { value: "debt_recovery", label: "Debt Recovery" },
  { value: "employment_dispute", label: "Employment Dispute" },
  { value: "regulatory_enforcement", label: "Regulatory Enforcement" },
] as const;

export function MattersTable() {
  const { data: matters, isLoading, error, refetch } = useMatters();
  const [open, setOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Matters {matters && `(${matters.length})`}
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Matter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Matter</DialogTitle>
              <DialogDescription>Create a new litigation matter</DialogDescription>
            </DialogHeader>
            <CreateMatterForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {!matters?.length ? (
        <EmptyState
          icon={FolderOpen}
          title="No matters yet"
          description="Create your first matter to get started"
        />
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matters.map((m) => (
                <tr key={m.public_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-sm">{m.client_name}</td>
                  <td className="px-4 py-3 text-sm">{formatLabel(m.matter_class)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDateTime(m.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link to="/clerk/$matterId" params={{ matterId: m.public_id }}>
                        <Button variant="ghost" size="sm">Intake</Button>
                      </Link>
                      <Link to="/lawyer/$matterId" params={{ matterId: m.public_id }}>
                        <Button variant="ghost" size="sm">Workspace</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateMatterForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [matterClass, setMatterClass] = useState("general_dispute");
  const createMatter = useCreateMatter();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createMatter.mutateAsync({
        name,
        client_name: clientName,
        matter_class: matterClass,
      });
      onSuccess();
      router.navigate({
        to: "/clerk/$matterId",
        params: { matterId: result.public_id },
      });
    } catch { /* error displayed via createMatter.error */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Matter Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Smith v. Jones"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Client Name</Label>
        <Input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="John Smith"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Matter Type</Label>
        <Select value={matterClass} onValueChange={setMatterClass}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALLOWED_MATTER_CLASSES.map((c) => (
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
      <Button type="submit" className="w-full" disabled={createMatter.isPending}>
        {createMatter.isPending ? "Creating..." : "Create Matter"}
      </Button>
    </form>
  );
}
