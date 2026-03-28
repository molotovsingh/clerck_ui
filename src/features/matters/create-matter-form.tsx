import { useState } from "react";
import { useCreateMatter } from "@/hooks/use-matters";
import { useRouter } from "@tanstack/react-router";
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
import { Plus, ChevronUp } from "lucide-react";
import { MATTER_CLASSES } from "@/lib/constants";

export function CreateMatterForm() {
  const [expanded, setExpanded] = useState(false);
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
      setExpanded(false);
      router.navigate({
        to: "/clerk/$matterId",
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
