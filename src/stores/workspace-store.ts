import { create } from "zustand";

export type WorkspaceMode = "review" | "draft";
export type SettingsTab = "access" | "transfers" | "analytics";

interface WorkspaceState {
  selectedMatterId: string | null;
  selectedDraftId: number | null;
  selectedSectionKey: string | null;
  selectedThreadId: string | null;
  activePanel: string | null;

  // New: mode-based workspace
  mode: WorkspaceMode;
  aiDrawerOpen: boolean;
  settingsDialogOpen: boolean;
  settingsTab: SettingsTab;
  filingWizardOpen: boolean;

  setSelectedMatterId: (id: string | null) => void;
  setSelectedDraftId: (id: number | null) => void;
  setSelectedSectionKey: (key: string | null) => void;
  setSelectedThreadId: (id: string | null) => void;
  setActivePanel: (panel: string | null) => void;

  setMode: (mode: WorkspaceMode) => void;
  enterDraftMode: (draftId: number) => void;
  setAiDrawerOpen: (open: boolean) => void;
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setFilingWizardOpen: (open: boolean) => void;

  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  selectedMatterId: null,
  selectedDraftId: null,
  selectedSectionKey: null,
  selectedThreadId: null,
  activePanel: null,

  mode: "review",
  aiDrawerOpen: false,
  settingsDialogOpen: false,
  settingsTab: "access",
  filingWizardOpen: false,

  setSelectedMatterId: (id) =>
    set({
      selectedMatterId: id,
      selectedDraftId: null,
      selectedSectionKey: null,
      selectedThreadId: null,
      mode: "review",
    }),
  setSelectedDraftId: (id) =>
    set({ selectedDraftId: id, selectedSectionKey: null }),
  setSelectedSectionKey: (key) => set({ selectedSectionKey: key }),
  setSelectedThreadId: (id) => set({ selectedThreadId: id }),
  setActivePanel: (panel) => set({ activePanel: panel }),

  setMode: (mode) => set({ mode }),
  enterDraftMode: (draftId) =>
    set({ mode: "draft", selectedDraftId: draftId, selectedSectionKey: null }),
  setAiDrawerOpen: (open) => set({ aiDrawerOpen: open }),
  openSettings: (tab) =>
    set({ settingsDialogOpen: true, settingsTab: tab ?? "access" }),
  closeSettings: () => set({ settingsDialogOpen: false }),
  setFilingWizardOpen: (open) => set({ filingWizardOpen: open }),

  reset: () =>
    set({
      selectedMatterId: null,
      selectedDraftId: null,
      selectedSectionKey: null,
      selectedThreadId: null,
      activePanel: null,
      mode: "review",
      aiDrawerOpen: false,
      settingsDialogOpen: false,
      settingsTab: "access",
      filingWizardOpen: false,
    }),
}));
