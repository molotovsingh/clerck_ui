import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { draftsApi } from "@/api/endpoints/drafts";
import { queryKeys } from "@/lib/query-keys";
import type {
  DraftCreate,
  DraftStatusUpdate,
  DraftVersionCreate,
} from "@/types/drafts";
import type {
  DraftSectionAmend,
  DraftSectionRegenerate,
  DraftSectionCommentCreate,
} from "@/types/draft-sections";

export function useDrafts(matterId: string) {
  return useQuery({
    queryKey: queryKeys.drafts.list(matterId),
    queryFn: () => draftsApi.list(matterId),
    enabled: !!matterId,
  });
}

export function useCreateDraft(matterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DraftCreate) => draftsApi.create(matterId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.drafts.list(matterId) }),
  });
}

export function useUpdateDraftStatus(matterId: string, draftId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DraftStatusUpdate) =>
      draftsApi.updateStatus(matterId, draftId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.drafts.list(matterId) }),
  });
}

export function useRequiredV1Drafts(matterId: string) {
  return useQuery({
    queryKey: queryKeys.drafts.requiredV1(matterId),
    queryFn: () => draftsApi.getRequiredV1(matterId),
    enabled: !!matterId,
  });
}

export function useDraftVersions(matterId: string, draftId: number) {
  return useQuery({
    queryKey: queryKeys.drafts.versions(matterId, draftId),
    queryFn: () => draftsApi.listVersions(matterId, draftId),
    enabled: !!matterId && !!draftId,
  });
}

export function useCreateDraftVersion(matterId: string, draftId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DraftVersionCreate) =>
      draftsApi.createVersion(matterId, draftId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.drafts.versions(matterId, draftId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.drafts.list(matterId) });
    },
  });
}

export function useDraftCompare(
  matterId: string,
  draftId: number,
  fromVersion: number,
  toVersion: number
) {
  return useQuery({
    queryKey: queryKeys.drafts.compare(matterId, draftId, fromVersion, toVersion),
    queryFn: () =>
      draftsApi.compareVersions(matterId, draftId, fromVersion, toVersion),
    enabled: !!matterId && !!draftId && fromVersion > 0 && toVersion > 0,
  });
}

export function useDraftSections(matterId: string, draftId: number) {
  return useQuery({
    queryKey: queryKeys.drafts.sections(matterId, draftId),
    queryFn: () => draftsApi.listSections(matterId, draftId),
    enabled: !!matterId && !!draftId,
  });
}

export function useAmendSection(
  matterId: string,
  draftId: number,
  sectionKey: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DraftSectionAmend) =>
      draftsApi.amendSection(matterId, draftId, sectionKey, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.drafts.sections(matterId, draftId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.drafts.versions(matterId, draftId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.drafts.list(matterId) });
    },
  });
}

export function useRegenerateSection(
  matterId: string,
  draftId: number,
  sectionKey: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DraftSectionRegenerate) =>
      draftsApi.regenerateSection(matterId, draftId, sectionKey, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.drafts.sections(matterId, draftId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.drafts.versions(matterId, draftId),
      });
    },
  });
}

export function useSectionComments(
  matterId: string,
  draftId: number,
  sectionKey: string
) {
  return useQuery({
    queryKey: queryKeys.drafts.comments(matterId, draftId, sectionKey),
    queryFn: () => draftsApi.listComments(matterId, draftId, sectionKey),
    enabled: !!matterId && !!draftId && !!sectionKey,
  });
}

export function useCreateSectionComment(
  matterId: string,
  draftId: number,
  sectionKey: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DraftSectionCommentCreate) =>
      draftsApi.createComment(matterId, draftId, sectionKey, data),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: queryKeys.drafts.comments(matterId, draftId, sectionKey),
      }),
  });
}
