import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "@tanstack/react-router";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { useMatter } from "@/hooks/use-matters";
import { useAccessSelf } from "@/hooks/use-access";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingPage } from "@/components/common/loading";
import { ErrorDisplay } from "@/components/common/error-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, ArrowLeft, ChevronDown } from "lucide-react";

// Sub-panels
import { EvidencePanel } from "./evidence-panel/evidence-panel";
import { ClaimsPanel } from "./claims-panel/claims-panel";
import { DraftsPanel } from "./drafts-panel/drafts-panel";
import { SectionsPanel } from "./sections-panel/sections-panel";
import { JobsPanel } from "./jobs-panel/jobs-panel";
import { AiThreadsPanel } from "./ai-panel/ai-threads-panel";
import { ExportsPanel } from "./exports-panel/exports-panel";
import { HandoffPanel } from "./handoff-panel/handoff-panel";
import { AccessPanel } from "./access-panel/access-panel";
import { ReadinessPanel } from "./readiness-panel/readiness-panel";
import { StatusPanel } from "./status-panel/status-panel";
import { AnalyticsPanel } from "./analytics-panel/analytics-panel";

export function LawyerWorkspacePage() {
  const { matterId } = useParams({ strict: false }) as { matterId: string };
  const { data: matter, isLoading, error } = useMatter(matterId);
  const { data: accessSelf } = useAccessSelf(matterId);
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState("evidence");
  const [rightTab, setRightTab] = useState("jobs");
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown on outside click
  useEffect(() => {
    if (!showMoreTabs) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreTabs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMoreTabs]);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorDisplay error={error} />;
  if (!matter) return <ErrorDisplay error={new Error("Matter not found")} />;

  const writeBlocked = accessSelf?.write_blocked_by_handoff_actor;

  return (
    <div className="flex h-full flex-col">
      {/* Matter header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Link
            to="/lawyer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mr-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <h2 className="font-semibold">{matter.name}</h2>
          <span className="text-sm text-muted-foreground">
            {matter.client_name}
          </span>
          <StatusBadge status={matter.status} />
        </div>
        {writeBlocked && (
          <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-1.5 text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            Editing locked — <Badge variant="outline">{writeBlocked}</Badge> is working on this
          </div>
        )}
      </div>

      {/* 3-pane layout */}
      <PanelGroup orientation="horizontal" className="flex-1">
        {/* Left Panel */}
        <Panel defaultSize={30} minSize={20}>
          <Tabs value={leftTab} onValueChange={setLeftTab} className="flex h-full flex-col">
            <TabsList className="mx-2 mt-2 w-fit">
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
              <TabsTrigger value="readiness">Readiness</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
              <TabsContent value="evidence" className="m-0 p-2">
                <EvidencePanel matterId={matterId} />
              </TabsContent>
              <TabsContent value="claims" className="m-0 p-2">
                <ClaimsPanel
                  matterId={matterId}
                  capabilities={accessSelf?.capabilities}
                />
              </TabsContent>
              <TabsContent value="readiness" className="m-0 p-2">
                <ReadinessPanel matterId={matterId} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </Panel>

        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />

        {/* Center Panel - Drafts & Sections */}
        <Panel defaultSize={40} minSize={25}>
          <div className="flex h-full flex-col">
            <DraftsPanel
              matterId={matterId}
              selectedDraftId={selectedDraftId}
              onSelectDraft={(id) => {
                setSelectedDraftId(id);
                setSelectedSectionKey(null);
              }}
              capabilities={accessSelf?.capabilities}
            />
            {selectedDraftId && (
              <SectionsPanel
                matterId={matterId}
                draftId={selectedDraftId}
                selectedSectionKey={selectedSectionKey}
                onSelectSection={setSelectedSectionKey}
                capabilities={accessSelf?.capabilities}
              />
            )}
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />

        {/* Right Panel */}
        <Panel defaultSize={30} minSize={20}>
          <Tabs value={rightTab} onValueChange={(v) => { setRightTab(v); setShowMoreTabs(false); }} className="flex h-full flex-col">
            <div className="mx-2 mt-2 flex items-center gap-1">
              <TabsList className="w-fit">
                <TabsTrigger value="jobs">Processing</TabsTrigger>
                <TabsTrigger value="exports">Exports</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>
              <div className="relative" ref={moreRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => setShowMoreTabs(!showMoreTabs)}
                >
                  More
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {showMoreTabs && (
                  <div className="absolute right-0 top-full z-50 mt-1 rounded-md border bg-popover p-1 shadow-md">
                    {(["ai", "handoffs", "access", "analytics"] as const).map((tab) => (
                      <button
                        key={tab}
                        className="flex w-full items-center rounded-sm px-3 py-1.5 text-sm hover:bg-muted capitalize"
                        onClick={() => { setRightTab(tab); setShowMoreTabs(false); }}
                      >
                        {tab === "ai" ? "AI Notes" : tab === "handoffs" ? "Transfers" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ScrollArea className="flex-1">
              <TabsContent value="ai" className="m-0 p-2">
                <AiThreadsPanel matterId={matterId} />
              </TabsContent>
              <TabsContent value="jobs" className="m-0 p-2">
                <JobsPanel
                  matterId={matterId}
                  capabilities={accessSelf?.capabilities}
                />
              </TabsContent>
              <TabsContent value="exports" className="m-0 p-2">
                <ExportsPanel
                  matterId={matterId}
                  capabilities={accessSelf?.capabilities}
                />
              </TabsContent>
              <TabsContent value="handoffs" className="m-0 p-2">
                <HandoffPanel
                  matterId={matterId}
                  capabilities={accessSelf?.capabilities}
                />
              </TabsContent>
              <TabsContent value="access" className="m-0 p-2">
                <AccessPanel
                  matterId={matterId}
                  capabilities={accessSelf?.capabilities}
                />
              </TabsContent>
              <TabsContent value="status" className="m-0 p-2">
                <StatusPanel
                  matterId={matterId}
                  matterStatus={matter.status}
                  capabilities={accessSelf?.capabilities}
                />
              </TabsContent>
              <TabsContent value="analytics" className="m-0 p-2">
                <AnalyticsPanel matterId={matterId} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </Panel>
      </PanelGroup>
    </div>
  );
}
