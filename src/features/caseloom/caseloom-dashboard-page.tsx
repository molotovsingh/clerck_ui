// @ts-nocheck — v1 CaseLoom retired, superseded by caseloom-v2
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMatters, useCreateMatter } from "@/hooks/use-matters";
import { LoadingSpinner } from "@/components/common/loading";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorDisplay } from "@/components/common/error-display";
import { CasesHeader } from "./dashboard/cases-header";
import { CaseCard } from "./dashboard/case-card";
import { FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const MATTER_CLASSES = [
  { value: "general_dispute", label: "General Dispute" },
  { value: "debt_recovery", label: "Debt Recovery" },
  { value: "employment_dispute", label: "Employment Dispute" },
  { value: "regulatory_enforcement", label: "Regulatory Enforcement" },
] as const;

export function CaseLoomDashboardPage() {
  const { data: matters, isLoading, error } = useMatters();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <CasesHeader onNewMatter={() => setShowCreate(true)} />
      {!matters?.length ? (
        <EmptyState
          icon={FolderOpen}
          title="No matters yet"
          description="Create your first matter to get started with CaseLoom"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {matters.map((m) => (
            <CaseCard key={m.public_id} matter={m} />
          ))}
        </div>
      )}
      <CreateMatterDialog
        open={showCreate}
        onOpenChange={setShowCreate}
      />
    </div>
  );
}

function CreateMatterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
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
      setName("");
      setClientName("");
      onOpenChange(false);
      router.navigate({
        to: "/caseloom/$matterId",
        params: { matterId: result.public_id },
      });
    } catch {
      /* error displayed inline */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Matter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-1.5">
            <Label className="text-xs">Matter Type</Label>
            <Select value={matterClass} onValueChange={setMatterClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATTER_CLASSES.map((c) => (
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
      </DialogContent>
    </Dialog>
  );
}
