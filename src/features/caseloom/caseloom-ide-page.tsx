import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { useMatter } from "@/hooks/use-matters";
import { useCaseLoomStore } from "@/stores/caseloom-store";
import { CaseLoomActivityBar } from "./ide/caseloom-activity-bar";
import { CaseLoomSidebar } from "./ide/caseloom-sidebar";
import { CaseLoomEditor } from "./ide/editor/caseloom-editor";
import { CaseLoomChatPanel } from "./ide/chat/caseloom-chat-panel";
import { CaseLoomStatusBar } from "./ide/caseloom-status-bar";
import { LoadingSpinner } from "@/components/common/loading";

export function CaseLoomIDEPage() {
  const { matterId } = useParams({ strict: false }) as { matterId: string };
  const { data: matter, isLoading, error } = useMatter(matterId);
  const reset = useCaseLoomStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, [matterId, reset]);

  if (isLoading) {
    return (
      <div
        data-theme="caseloom"
        className="flex h-screen items-center justify-center"
        style={{
          background: "var(--cl-bg)",
          color: "var(--cl-text)",
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-theme="caseloom"
        className="flex h-screen items-center justify-center"
        style={{
          background: "var(--cl-bg)",
          color: "var(--cl-red)",
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        <p>Failed to load matter: {error.message}</p>
      </div>
    );
  }

  return (
    <div
      data-theme="caseloom"
      className="flex h-screen flex-col overflow-hidden"
      style={{
        background: "var(--cl-bg)",
        color: "var(--cl-text)",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      <div className="flex flex-1 overflow-hidden">
        <CaseLoomActivityBar />
        <CaseLoomSidebar matterId={matterId} />
        <CaseLoomEditor matterId={matterId} />
        <CaseLoomChatPanel matterId={matterId} />
      </div>
      <CaseLoomStatusBar matter={matter} matterId={matterId} />
    </div>
  );
}
