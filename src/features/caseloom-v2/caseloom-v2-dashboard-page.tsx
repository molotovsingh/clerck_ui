import { useMatters } from "@/hooks/use-matters";
import { useRouter } from "@tanstack/react-router";
import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";
import { MatterStatus } from "@/types/enums";
import { CaseLoomV2TopBar } from "./caseloom-v2-top-bar";
import { CaseLoomV2Toast } from "./caseloom-v2-toast";
import { CaseCardV2 } from "./dashboard/case-card-v2";
import { ActivitySidebar } from "./dashboard/activity-sidebar";
import { LoadingSpinner } from "@/components/common/loading";

const FILTERS = ["all", "active", "new", "alerts", "archived"] as const;

export function CaseLoomV2DashboardPage() {
  const { data: matters, isLoading } = useMatters();
  const search = useCaseLoomV2Store((s) => s.search);
  const filter = useCaseLoomV2Store((s) => s.filter);
  const setSearch = useCaseLoomV2Store((s) => s.setSearch);
  const setFilter = useCaseLoomV2Store((s) => s.setFilter);
  const router = useRouter();

  const filtered = (matters ?? []).filter((m) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      m.name.toLowerCase().includes(s) ||
      m.client_name.toLowerCase().includes(s) ||
      m.public_id.includes(s);

    if (filter === "all") return matchSearch;
    if (filter === "active")
      return matchSearch && m.status === MatterStatus.UNDER_REVIEW;
    if (filter === "new")
      return matchSearch && m.status === MatterStatus.INTAKE;
    if (filter === "archived")
      return matchSearch && m.status === MatterStatus.FILED;
    // "alerts" — just show all for now (would need alert data)
    return matchSearch;
  });

  const activeCount = (matters ?? []).filter(
    (m) =>
      m.status === MatterStatus.UNDER_REVIEW ||
      m.status === MatterStatus.INTAKE
  ).length;

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
      <CaseLoomV2TopBar
        right={
          <button
            onClick={() =>
              router.navigate({ to: "/caseloom-v2/onboarding" })
            }
            className="cursor-pointer rounded-lg px-4 py-[7px] text-xs font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))",
              border: "none",
              color: "var(--cl-bg)",
              fontFamily: "inherit",
            }}
          >
            + New Case
          </button>
        }
      >
        <span
          className="ml-2 text-[10px]"
          style={{ color: "var(--cl-dim)" }}
        >
          {activeCount} active
        </span>
      </CaseLoomV2TopBar>

      <div className="flex flex-1 overflow-hidden">
        {/* Main grid */}
        <div className="flex-1 overflow-auto p-5">
          {/* Search + filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, case type, or ID..."
              className="min-w-[200px] flex-1 rounded-lg px-3.5 py-2 text-xs outline-none"
              style={{
                background: "var(--cl-surface)",
                border: "1px solid var(--cl-border)",
                color: "var(--cl-text)",
                fontFamily: "inherit",
              }}
            />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="cursor-pointer rounded-[7px] px-3 py-1.5 text-[11px] font-semibold capitalize"
                style={{
                  background: filter === f ? "var(--cl-surface)" : "transparent",
                  color: filter === f ? "var(--cl-bright)" : "var(--cl-dim)",
                  outline:
                    filter === f
                      ? "1px solid var(--cl-border)"
                      : "none",
                  border: "none",
                  fontFamily: "inherit",
                }}
              >
                {f === "alerts" ? "\u26A0 Alerts" : f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="py-10 text-[13px]"
              style={{ color: "var(--cl-dim)" }}
            >
              No cases match your search.
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-3">
              {filtered.map((m) => (
                <CaseCardV2 key={m.public_id} matter={m} />
              ))}
            </div>
          )}
        </div>

        {/* Activity sidebar */}
        <ActivitySidebar matters={matters ?? []} />
      </div>

      <CaseLoomV2Toast />
    </div>
  );
}
