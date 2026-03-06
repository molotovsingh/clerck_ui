import { useEffect } from "react";
import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";

export function CaseLoomV2Toast() {
  const toast = useCaseLoomV2Store((s) => s.toast);
  const clearToast = useCaseLoomV2Store((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2.5 rounded-[10px] px-5 py-3"
      style={{
        background: "var(--cl-surface)",
        border: `1px solid color-mix(in srgb, ${toast.color} 30%, transparent)`,
        boxShadow: "0 4px 24px color-mix(in srgb, var(--cl-bg) 80%, transparent)",
        animation: "fadeUp 0.3s ease",
      }}
    >
      <span className="text-sm" style={{ color: toast.color }}>
        {"\u2713"}
      </span>
      <span
        className="text-xs font-semibold"
        style={{ color: "var(--cl-bright)" }}
      >
        {toast.msg}
      </span>
    </div>
  );
}
