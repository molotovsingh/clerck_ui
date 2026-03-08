import { create } from "zustand";

export type WorkspaceMode = "intake" | "review" | "draft" | "ide";
export type SettingsTab = "access" | "transfers" | "analytics";

interface WorkspaceState {
  selectedMatterId: string | null;
  selectedDraftId: number | null;
  selectedSectionKey: string | null;

  mode: WorkspaceMode;
  fullscreen: boolean;
  aiDrawerOpen: boolean;
  settingsDialogOpen: boolean;
  settingsTab: SettingsTab;
  filingWizardOpen: boolean;

  setSelectedMatterId: (id: string | null) => void;
  setSelectedDraftId: (id: number | null) => void;
  setSelectedSectionKey: (key: string | null) => void;

  setMode: (mode: WorkspaceMode) => void;
  setFullscreen: (fullscreen: boolean) => void;
  enterDraftMode: (draftId: number) => void;
  setAiDrawerOpen: (open: boolean) => void;
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setFilingWizardOpen: (open: boolean) => void;

  reset: () => void;
}

const initialState = {
  selectedMatterId: null as string | null,
  selectedDraftId: null as number | null,
  selectedSectionKey: null as string | null,
  mode: "review" as WorkspaceMode,
  fullscreen: false,
  aiDrawerOpen: false,
  settingsDialogOpen: false,
  settingsTab: "access" as SettingsTab,
  filingWizardOpen: false,
};

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  ...initialState,

  setSelectedMatterId: (id) =>
    set({
      selectedMatterId: id,
      selectedDraftId: null,
      selectedSectionKey: null,
      mode: "review",
      fullscreen: false,
    }),
  setSelectedDraftId: (id) =>
    set({ selectedDraftId: id, selectedSectionKey: null }),
  setSelectedSectionKey: (key) => set({ selectedSectionKey: key }),

  setMode: (mode) => set({ mode, fullscreen: mode === "ide" }),
  setFullscreen: (fullscreen) => set({ fullscreen }),
  enterDraftMode: (draftId) =>
    set({ mode: "draft", selectedDraftId: draftId, selectedSectionKey: null }),
  setAiDrawerOpen: (open) => set({ aiDrawerOpen: open }),
  openSettings: (tab) =>
    set({ settingsDialogOpen: true, settingsTab: tab ?? "access" }),
  closeSettings: () => set({ settingsDialogOpen: false }),
  setFilingWizardOpen: (open) => set({ filingWizardOpen: open }),

  reset: () => set({ ...initialState }),
}));
