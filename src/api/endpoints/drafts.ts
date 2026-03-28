import { api } from "../client";
import type {
  Draft,
  DraftCreate,
  DraftStatusUpdate,
  DraftVersion,
  DraftVersionCreate,
  DraftVersionCompare,
  RequiredV1DraftCoverage,
} from "@/types/drafts";
import type {
  DraftSection,
  DraftSectionAmend,
  DraftSectionRegenerate,
  DraftSectionRegenerateOut,
  DraftSectionComment,
  DraftSectionCommentCreate,
} from "@/types/draft-sections";
import { paginationParams } from "@/lib/constants";

export const draftsApi = {
  list: (matterId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Draft[]>(`/matters/${matterId}/drafts`, {
      params: paginationParams(params),
    }),

  create: (matterId: string, data: DraftCreate) =>
    api.post<Draft>(`/matters/${matterId}/drafts`, { body: data }),

  updateStatus: (matterId: string, draftId: number, data: DraftStatusUpdate) =>
    api.patch<Draft>(`/matters/${matterId}/drafts/${draftId}/status`, {
      body: data,
    }),

  getRequiredV1: (matterId: string) =>
    api.get<RequiredV1DraftCoverage>(
      `/matters/${matterId}/drafts/required-v1`
    ),

  // Versions
  listVersions: (
    matterId: string,
    draftId: number,
    params?: { limit?: number; offset?: number }
  ) =>
    api.get<DraftVersion[]>(
      `/matters/${matterId}/drafts/${draftId}/versions`,
      { params: paginationParams(params) }
    ),

  createVersion: (
    matterId: string,
    draftId: number,
    data: DraftVersionCreate
  ) =>
    api.post<DraftVersion>(
      `/matters/${matterId}/drafts/${draftId}/versions`,
      { body: data }
    ),

  compareVersions: (
    matterId: string,
    draftId: number,
    fromVersion: number,
    toVersion: number,
    contextLines?: number
  ) =>
    api.get<DraftVersionCompare>(
      `/matters/${matterId}/drafts/${draftId}/compare`,
      {
        params: {
          from_version: fromVersion,
          to_version: toVersion,
          context_lines: contextLines ?? 3,
        },
      }
    ),

  // Sections
  listSections: (matterId: string, draftId: number) =>
    api.get<DraftSection[]>(
      `/matters/${matterId}/drafts/${draftId}/sections`
    ),

  listVersionSections: (
    matterId: string,
    draftId: number,
    versionNumber: number
  ) =>
    api.get<DraftSection[]>(
      `/matters/${matterId}/drafts/${draftId}/versions/${versionNumber}/sections`
    ),

  amendSection: (
    matterId: string,
    draftId: number,
    sectionKey: string,
    data: DraftSectionAmend
  ) =>
    api.post<DraftVersion>(
      `/matters/${matterId}/drafts/${draftId}/sections/${sectionKey}/amend`,
      { body: data }
    ),

  regenerateSection: (
    matterId: string,
    draftId: number,
    sectionKey: string,
    data: DraftSectionRegenerate
  ) =>
    api.post<DraftSectionRegenerateOut>(
      `/matters/${matterId}/drafts/${draftId}/sections/${sectionKey}/regenerate`,
      { body: data }
    ),

  // Comments
  listComments: (
    matterId: string,
    draftId: number,
    sectionKey: string,
    params?: { limit?: number; offset?: number }
  ) =>
    api.get<DraftSectionComment[]>(
      `/matters/${matterId}/drafts/${draftId}/sections/${sectionKey}/comments`,
      { params: paginationParams(params) }
    ),

  createComment: (
    matterId: string,
    draftId: number,
    sectionKey: string,
    data: DraftSectionCommentCreate
  ) =>
    api.post<DraftSectionComment>(
      `/matters/${matterId}/drafts/${draftId}/sections/${sectionKey}/comments`,
      { body: data }
    ),
};
