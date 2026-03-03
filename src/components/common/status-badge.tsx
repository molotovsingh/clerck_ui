import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatLabel } from "@/lib/format-label";
import { MatterStatus, DraftStatus, JobStatus, HandoffStatus } from "@/types/enums";

const matterStatusColors: Record<MatterStatus, string> = {
  [MatterStatus.INTAKE]: "bg-blue-100 text-blue-800 border-blue-200",
  [MatterStatus.UNDER_REVIEW]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [MatterStatus.CLIENT_APPROVED]: "bg-green-100 text-green-800 border-green-200",
  [MatterStatus.FILED]: "bg-purple-100 text-purple-800 border-purple-200",
};

const draftStatusColors: Record<DraftStatus, string> = {
  [DraftStatus.DRAFT]: "bg-gray-100 text-gray-800 border-gray-200",
  [DraftStatus.REVIEW_READY]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [DraftStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200",
};

const jobStatusColors: Record<JobStatus, string> = {
  [JobStatus.QUEUED]: "bg-gray-100 text-gray-800 border-gray-200",
  [JobStatus.RUNNING]: "bg-blue-100 text-blue-800 border-blue-200",
  [JobStatus.SUCCEEDED]: "bg-green-100 text-green-800 border-green-200",
  [JobStatus.FAILED]: "bg-red-100 text-red-800 border-red-200",
};

const handoffStatusColors: Record<HandoffStatus, string> = {
  [HandoffStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [HandoffStatus.ACCEPTED]: "bg-green-100 text-green-800 border-green-200",
  [HandoffStatus.DECLINED]: "bg-red-100 text-red-800 border-red-200",
  [HandoffStatus.CANCELED]: "bg-gray-100 text-gray-800 border-gray-200",
};

type StatusType = MatterStatus | DraftStatus | JobStatus | HandoffStatus;

export function StatusBadge({ status }: { status: StatusType }) {
  const colorMap = {
    ...matterStatusColors,
    ...draftStatusColors,
    ...jobStatusColors,
    ...handoffStatusColors,
  } as Record<string, string>;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", colorMap[status])}
    >
      {formatLabel(status)}
    </Badge>
  );
}
