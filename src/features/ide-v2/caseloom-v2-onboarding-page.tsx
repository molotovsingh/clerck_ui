import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCaseLoomV2Store } from "@/stores/caseloom-v2-store";
import { useCreateMatter } from "@/hooks/use-matters";
import { intakeApi } from "@/api/endpoints/intake";
import { jobsApi } from "@/api/endpoints/jobs";
import { JobType } from "@/types/enums";
import { queryKeys } from "@/lib/query-keys";
import { CaseLoomV2TopBar } from "./caseloom-v2-top-bar";
import { CaseLoomV2Toast } from "./caseloom-v2-toast";
import { ObStepNav } from "./onboarding/ob-step-nav";
import { ObStart } from "./onboarding/ob-start";
import { ObUpload } from "./onboarding/ob-upload";
import { ObProcessing } from "./onboarding/ob-processing";
import { ObCaseDetails } from "./onboarding/ob-case-details";
import { ObReview } from "./onboarding/ob-review";
import { ObDone } from "./onboarding/ob-done";

const OB_STEPS_COUNT = 6;

export function CaseLoomV2OnboardingPage() {
  const router = useRouter();
  const obStep = useCaseLoomV2Store((s) => s.obStep);
  const setObStep = useCaseLoomV2Store((s) => s.setObStep);
  const obFiles = useCaseLoomV2Store((s) => s.obFiles);
  const obProcessingStep = useCaseLoomV2Store((s) => s.obProcessingStep);
  const obQa = useCaseLoomV2Store((s) => s.obQa);
  const resetOnboarding = useCaseLoomV2Store((s) => s.resetOnboarding);
  const showToast = useCaseLoomV2Store((s) => s.showToast);

  const createMatter = useCreateMatter();
  const queryClient = useQueryClient();

  const canNext = () => {
    if (obStep === 1) return obFiles.length > 0;
    if (obStep === 2) return obProcessingStep >= 7; // all 8 steps done
    if (obStep === 3)
      return !!(
        obQa.case_type &&
        obQa.jurisdiction &&
        obQa.client_name &&
        obQa.opposing &&
        obQa.matter_class
      );
    return true;
  };

  const completeOnboarding = async (navigateToIDE: boolean) => {
    const clientName = obQa.client_name || "New Client";
    const opposing = obQa.opposing || "Opposing Party";
    const caseName = `${clientName} v. ${opposing}`;

    try {
      const matter = await createMatter.mutateAsync({
        name: caseName,
        client_name: clientName,
        matter_class: obQa.matter_class || "general_dispute",
      });

      const matterId = matter.public_id;

      // Persist onboarding case details into intake context (PATCH — partial save)
      try {
        await intakeApi.patchContext(matterId, {
          context_inputs: {
            case_type: obQa.case_type ?? "",
            jurisdiction: obQa.jurisdiction ?? "",
            opposing: obQa.opposing ?? "",
            filing_date: obQa.filing_date ?? "",
            urgency: obQa.urgency ?? "",
          },
        });
      } catch {
        // Non-critical — context can be updated later from the IDE
      }

      // Upload files if any were dropped during onboarding
      if (obFiles.length > 0) {
        try {
          await intakeApi.uploadFiles(matterId, obFiles);
        } catch {
          showToast("Files failed to upload — you can retry from the IDE");
        }
      }

      // Queue initial processing jobs
      const jobTypes = [JobType.OCR, JobType.TIMELINE, JobType.CLAIM_MATRIX];
      for (const job_type of jobTypes) {
        try {
          await jobsApi.queue(matterId, { job_type });
        } catch {
          // Non-critical — jobs can be queued manually later
        }
      }

      // Invalidate relevant caches
      await queryClient.invalidateQueries({
        queryKey: queryKeys.evidence.list(matterId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.jobs.list(matterId),
      });

      showToast(`Case created: ${caseName}`);
      resetOnboarding();

      if (navigateToIDE) {
        router.navigate({
          to: "/caseloom-v2/$matterId",
          params: { matterId },
        });
      } else {
        router.navigate({ to: "/caseloom-v2" });
      }
    } catch {
      // Error shown via mutation state
    }
  };

  const handleNext = () => {
    if (obStep === OB_STEPS_COUNT - 2) {
      // Review step → create case
      completeOnboarding(false);
    } else {
      setObStep(obStep + 1);
    }
  };

  const goBack = () => {
    if (obStep > 0) setObStep(obStep - 1);
  };

  const backToDashboard = () => {
    resetOnboarding();
    router.navigate({ to: "/caseloom-v2" });
  };

  const screens = [
    <ObStart key="start" />,
    <ObUpload key="upload" />,
    <ObProcessing key="processing" />,
    <ObCaseDetails key="details" />,
    <ObReview key="review" />,
    <ObDone
      key="done"
      onViewDashboard={backToDashboard}
      onOpenIDE={() => completeOnboarding(true)}
    />,
  ];

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
            onClick={backToDashboard}
            className="cursor-pointer rounded-[7px] px-3 py-1.5 text-[11px]"
            style={{
              background: "transparent",
              border: "1px solid var(--cl-border)",
              color: "var(--cl-muted)",
              fontFamily: "inherit",
            }}
          >
            {"\u2190"} Back to cases
          </button>
        }
      >
        <ObStepNav />
      </CaseLoomV2TopBar>

      <div className="flex-1 overflow-auto">{screens[obStep]}</div>

      {/* Bottom nav */}
      <div
        className="flex shrink-0 items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid var(--cl-border)" }}
      >
        <button
          onClick={goBack}
          disabled={obStep === 0}
          className="cursor-pointer rounded-lg px-5 py-2.5 text-[13px] font-bold"
          style={{
            background: "var(--cl-surface)",
            border: "1px solid var(--cl-border)",
            color: "var(--cl-muted)",
            fontFamily: "inherit",
            opacity: obStep === 0 ? 0.3 : 1,
            cursor: obStep === 0 ? "default" : "pointer",
          }}
        >
          {"\u2190"} Back
        </button>
        <span className="text-[11px]" style={{ color: "var(--cl-dim)" }}>
          Step {obStep + 1} of {OB_STEPS_COUNT}
        </span>
        {obStep < OB_STEPS_COUNT - 1 && (
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="rounded-lg px-5 py-2.5 text-[13px] font-bold"
            style={{
              background: canNext()
                ? "linear-gradient(135deg, var(--cl-gold), var(--cl-gold-dk))"
                : "color-mix(in srgb, var(--cl-dim) 27%, transparent)",
              border: "none",
              color: canNext() ? "var(--cl-bg)" : "var(--cl-dim)",
              fontFamily: "inherit",
              cursor: canNext() ? "pointer" : "default",
              opacity: canNext() ? 1 : 0.5,
            }}
          >
            {obStep === OB_STEPS_COUNT - 2
              ? "Create Case \u2192"
              : "Continue \u2192"}
          </button>
        )}
        {obStep === OB_STEPS_COUNT - 1 && <div />}
      </div>

      <CaseLoomV2Toast />
    </div>
  );
}
