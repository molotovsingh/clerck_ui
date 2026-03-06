import { create } from "zustand";

export interface OnboardingQA {
  case_type?: string;
  jurisdiction?: string;
  client_name?: string;
  opposing?: string;
  filing_date?: string;
  urgency?: string;
}

interface CaseLoomV2State {
  // Dashboard
  search: string;
  filter: "all" | "active" | "new" | "alerts" | "archived";

  // Onboarding
  obStep: number;
  obFiles: File[];
  obProcessingStep: number; // -1 = not started, 0..7 = current step
  obQa: OnboardingQA;

  // Toast
  toast: { msg: string; color: string } | null;

  // Dashboard actions
  setSearch: (v: string) => void;
  setFilter: (v: CaseLoomV2State["filter"]) => void;

  // Onboarding actions
  setObStep: (v: number) => void;
  setObFiles: (files: File[]) => void;
  setObProcessingStep: (v: number) => void;
  setObQa: (qa: OnboardingQA) => void;
  updateObQa: (field: string, value: string) => void;
  resetOnboarding: () => void;

  // Toast
  showToast: (msg: string, color?: string) => void;
  clearToast: () => void;
}

export const useCaseLoomV2Store = create<CaseLoomV2State>()((set) => ({
  search: "",
  filter: "all",

  obStep: 0,
  obFiles: [],
  obProcessingStep: -1,
  obQa: {},

  toast: null,

  setSearch: (v) => set({ search: v }),
  setFilter: (v) => set({ filter: v }),

  setObStep: (v) => set({ obStep: v }),
  setObFiles: (files) => set({ obFiles: files }),
  setObProcessingStep: (v) => set({ obProcessingStep: v }),
  setObQa: (qa) => set({ obQa: qa }),
  updateObQa: (field, value) =>
    set((s) => ({ obQa: { ...s.obQa, [field]: value } })),
  resetOnboarding: () =>
    set({ obStep: 0, obFiles: [], obProcessingStep: -1, obQa: {} }),

  showToast: (msg, color = "var(--cl-green)") => set({ toast: { msg, color } }),
  clearToast: () => set({ toast: null }),
}));
