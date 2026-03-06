import { create } from "zustand";

export type ActivityView = "explorer" | "search" | "timeline" | "outbox";

interface OpenTab {
  draftId: number;
  title: string;
}

interface CaseLoomState {
  activityView: ActivityView;
  openSections: Record<string, boolean>;
  activeDraftId: number | null;
  activeVersionNumber: number | null;
  activeSectionKey: string | null;
  chatCollapsed: boolean;
  selectedThreadId: string | null;
  openTabs: OpenTab[];

  setActivityView: (v: ActivityView) => void;
  toggleSection: (key: string) => void;
  setActiveDraft: (id: number, title: string) => void;
  setActiveVersion: (version: number) => void;
  setActiveSectionKey: (key: string | null) => void;
  setChatCollapsed: (v: boolean) => void;
  setSelectedThreadId: (id: string | null) => void;
  openTab: (draftId: number, title: string) => void;
  closeTab: (draftId: number) => void;
  reset: () => void;
}

const defaultSections: Record<string, boolean> = {
  INBOX: true,
  SOURCES: true,
  WORKING: false,
  OUTPUTS: true,
  OUTBOX: true,
};

const initialState = {
  activityView: "explorer" as ActivityView,
  openSections: { ...defaultSections },
  activeDraftId: null as number | null,
  activeVersionNumber: null as number | null,
  activeSectionKey: null as string | null,
  chatCollapsed: false,
  selectedThreadId: null as string | null,
  openTabs: [] as OpenTab[],
};

export const useCaseLoomStore = create<CaseLoomState>()((set, get) => ({
  ...initialState,

  setActivityView: (v) => set({ activityView: v }),

  toggleSection: (key) =>
    set((s) => ({
      openSections: { ...s.openSections, [key]: !s.openSections[key] },
    })),

  setActiveDraft: (id, title) => {
    const state = get();
    const alreadyOpen = state.openTabs.some((t) => t.draftId === id);
    set({
      activeDraftId: id,
      activeVersionNumber: null,
      activeSectionKey: null,
      openTabs: alreadyOpen
        ? state.openTabs
        : [...state.openTabs, { draftId: id, title }],
    });
  },

  setActiveVersion: (version) => set({ activeVersionNumber: version }),

  setActiveSectionKey: (key) => set({ activeSectionKey: key }),

  setChatCollapsed: (v) => set({ chatCollapsed: v }),

  setSelectedThreadId: (id) => set({ selectedThreadId: id }),

  openTab: (draftId, title) => {
    const state = get();
    if (state.openTabs.some((t) => t.draftId === draftId)) {
      set({ activeDraftId: draftId });
      return;
    }
    set({
      openTabs: [...state.openTabs, { draftId, title }],
      activeDraftId: draftId,
    });
  },

  closeTab: (draftId) =>
    set((s) => {
      const tabs = s.openTabs.filter((t) => t.draftId !== draftId);
      const newActive =
        s.activeDraftId === draftId
          ? tabs.length > 0
            ? tabs[tabs.length - 1]!.draftId
            : null
          : s.activeDraftId;
      return { openTabs: tabs, activeDraftId: newActive };
    }),

  reset: () =>
    set({ ...initialState, openSections: { ...defaultSections } }),
}));
