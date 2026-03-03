import { create } from "zustand";

interface WorkspaceState {
  selectedMatterId: string | null;
  selectedDraftId: number | null;
  selectedSectionKey: string | null;
  selectedThreadId: string | null;
  activePanel: string | null;

  setSelectedMatterId: (id: string | null) => void;
  setSelectedDraftId: (id: number | null) => void;
  setSelectedSectionKey: (key: string | null) => void;
  setSelectedThreadId: (id: string | null) => void;
  setActivePanel: (panel: string | null) => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  selectedMatterId: null,
  selectedDraftId: null,
  selectedSectionKey: null,
  selectedThreadId: null,
  activePanel: null,

  setSelectedMatterId: (id) =>
    set({
      selectedMatterId: id,
      selectedDraftId: null,
      selectedSectionKey: null,
      selectedThreadId: null,
    }),
  setSelectedDraftId: (id) =>
    set({ selectedDraftId: id, selectedSectionKey: null }),
  setSelectedSectionKey: (key) => set({ selectedSectionKey: key }),
  setSelectedThreadId: (id) => set({ selectedThreadId: id }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  reset: () =>
    set({
      selectedMatterId: null,
      selectedDraftId: null,
      selectedSectionKey: null,
      selectedThreadId: null,
      activePanel: null,
    }),
}));
