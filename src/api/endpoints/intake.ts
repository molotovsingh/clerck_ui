import { api } from "../client";
import type {
  IntakeContext,
  IntakeContextPatch,
  IntakeContextUpdate,
  IntakeIngestOut,
  IntakeProgress,
} from "@/types/intake";

export const intakeApi = {
  getProgress: (matterId: string) =>
    api.get<IntakeProgress>(`/matters/${matterId}/intake/progress`),

  getContext: (matterId: string) =>
    api.get<IntakeContext>(`/matters/${matterId}/intake/context`),

  updateContext: (matterId: string, data: IntakeContextUpdate) =>
    api.put<IntakeContext>(`/matters/${matterId}/intake/context`, {
      body: data,
    }),

  patchContext: (matterId: string, data: IntakeContextPatch) =>
    api.patch<IntakeContext>(`/matters/${matterId}/intake/context`, {
      body: data,
    }),

  uploadFiles: (matterId: string, files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      // Preserve folder structure via webkitRelativePath
      const name = file.webkitRelativePath || file.name;
      formData.append("files", file, name);
    }
    return api.post<IntakeIngestOut>(
      `/matters/${matterId}/intake/upload`,
      { body: formData }
    );
  },
};
