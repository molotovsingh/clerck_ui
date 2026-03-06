import { useState, useEffect, useRef } from "react";
import { useIntakeContext, useUpdateIntakeContext } from "@/hooks/use-intake";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { StepIndicator } from "./step-indicator";
import { HelpTip } from "@/components/common/help-tip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2, Mic, MicOff } from "lucide-react";

interface Props {
  matterId: string;
  step1Done: boolean;
  step2Done: boolean;
}

export function DisputeCard({ matterId, step1Done, step2Done }: Props) {
  const { data: context } = useIntakeContext(matterId);
  const updateCtx = useUpdateIntakeContext(matterId);

  const [disputeTemplate, setDisputeTemplate] = useState("");
  const [narrative, setNarrative] = useState("");
  const [contextInputs, setContextInputs] = useState<
    { key: string; value: string }[]
  >([{ key: "Parties involved", value: "" }]);
  const [ctxInitialized, setCtxInitialized] = useState(false);
  const [ctxSaved, setCtxSaved] = useState(false);
  const { isListening, isSupported, transcript, start, stop, resetTranscript } = useSpeechRecognition();
  const prevTranscriptLen = useRef(0);

  useEffect(() => {
    if (transcript.length > prevTranscriptLen.current) {
      const newContent = transcript.slice(prevTranscriptLen.current);
      setNarrative((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + newContent);
      prevTranscriptLen.current = transcript.length;
    }
  }, [transcript]);

  // Sync from server once
  if (context && !ctxInitialized) {
    setDisputeTemplate(context.dispute_template ?? "");
    setNarrative(context.narrative ?? "");
    const entries = Object.entries(context.context_inputs ?? {});
    setContextInputs(
      entries.length > 0
        ? entries.map(([key, value]) => ({ key, value: String(value ?? "") }))
        : [{ key: "Parties involved", value: "" }]
    );
    setCtxInitialized(true);
  }

  const handleSaveContext = () => {
    const inputs: Record<string, string> = {};
    for (const { key, value } of contextInputs) {
      const k = key.trim();
      if (k) inputs[k] = value.trim();
    }
    setCtxSaved(false);
    updateCtx.mutate(
      {
        dispute_template: disputeTemplate || null,
        narrative: narrative || null,
        context_inputs: Object.keys(inputs).length > 0 ? inputs : undefined,
      },
      {
        onSuccess: () => {
          setCtxSaved(true);
          toast.success("Dispute details saved");
        },
      }
    );
  };

  return (
    <Card id="step-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <StepIndicator step={2} done={step2Done} active={step1Done && !step2Done} />
          Describe the Dispute
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Dispute Type <span className="text-destructive">*</span>
            <HelpTip content="The legal category that best describes this dispute." />
          </Label>
          <Input
            value={disputeTemplate}
            onChange={(e) => setDisputeTemplate(e.target.value)}
            placeholder="e.g. Breach of Contract, Debt Recovery, Employment"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            What happened? <span className="text-destructive">*</span>
            <HelpTip content="Describe the dispute in plain language — who, what, when, and the core issue." />
            {isSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 ml-auto",
                  isListening && "text-red-500 animate-pulse"
                )}
                onClick={() => {
                  if (isListening) {
                    stop();
                  } else {
                    prevTranscriptLen.current = 0;
                    resetTranscript();
                    start();
                  }
                }}
                aria-label={isListening ? "Stop dictation" : "Start dictation"}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
            )}
          </Label>
          {isListening && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Listening... speak now
            </div>
          )}
          <Textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Describe the dispute in plain language — who did what, when, and what's the issue..."
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label>Additional Details (optional but helpful)</Label>
          <p className="text-xs text-muted-foreground">
            Add any relevant facts: parties, dates, amounts, jurisdiction
          </p>
          <div className="space-y-2">
            {contextInputs.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={entry.key}
                  onChange={(e) => {
                    const next = contextInputs.map((item, j) =>
                      j === i
                        ? { key: e.target.value, value: item.value }
                        : item
                    );
                    setContextInputs(next);
                  }}
                  placeholder="e.g. Parties involved, Jurisdiction, Amount"
                  className="w-2/5"
                />
                <Input
                  value={entry.value}
                  onChange={(e) => {
                    const next = contextInputs.map((item, j) =>
                      j === i
                        ? { key: item.key, value: e.target.value }
                        : item
                    );
                    setContextInputs(next);
                  }}
                  placeholder="Value"
                  className="flex-1"
                />
                {contextInputs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() =>
                      setContextInputs(
                        contextInputs.filter((_, j) => j !== i)
                      )
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setContextInputs([
                  ...contextInputs,
                  { key: "", value: "" },
                ])
              }
            >
              <Plus className="h-3 w-3" />
              Add Detail
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveContext}
            disabled={updateCtx.isPending}
          >
            {updateCtx.isPending ? "Saving..." : "Save"}
          </Button>
          {ctxSaved && !updateCtx.isPending && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Details saved — you can now order documents
            </span>
          )}
        </div>
        {updateCtx.error && (
          <p className="text-sm text-destructive">
            {updateCtx.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
