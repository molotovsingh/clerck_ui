import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useMatters, useCreateMatter } from "@/hooks/use-matters";
import { useMatterClassOptions } from "@/hooks/use-matter-class-options";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FolderOpen, Plus, ChevronUp } from "lucide-react";
import { formatLabel } from "@/lib/format-label";

export function ClerkLanding() {
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Matters</h1>
        <p className="text-sm text-muted-foreground">
          Create a new matter or select an existing one to continue
        </p>
      </div>
      <InlineCreateMatter />
      <ClerkMatterSelector />
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
        to: "/clerk/$matterId",
        params: { matterId: result.public_id },
      });
    } catch { /* error displayed via createMatter.error */ }
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
              <Label className="text-xs">Matter Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smith v. Jones"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Client Name</Label>
              <Input
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
            {createMatter.isPending ? "Creating..." : "Create & Start Intake"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ClerkMatterSelector() {
  const { data: matters, isLoading } = useMatters();
  if (isLoading) return <LoadingSpinner />;
  if (!matters?.length) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No matters yet"
        description="Create your first matter above to get started"
      />
    );
  }
  return (
    <div className="space-y-2">
      {matters.map((m) => (
        <Link
          key={m.public_id}
          to="/clerk/$matterId"
          params={{ matterId: m.public_id }}
          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
        >
          <div>
            <p className="font-medium">{m.name}</p>
            <p className="text-sm text-muted-foreground">
              {m.client_name}
              <span className="mx-1.5 text-muted-foreground/50">&middot;</span>
              {formatLabel(m.matter_class)}
            </p>
          </div>
          <StatusBadge status={m.status} />
        </Link>
      ))}
    </div>
  );
}
