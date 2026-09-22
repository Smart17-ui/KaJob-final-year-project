import type {
  ReportStatus,
} from "../../shared/types/report";

import {
  REPORT_STATUS_LABELS,
} from "../../shared/types/report";

/* =========================================================
   PROPS
   ========================================================= */

interface ReportStatusBadgeProps {
  status: ReportStatus;
  statusDisplay?: string;
}

/* =========================================================
   STATUS STYLES
   ========================================================= */

const getStatusClasses = (
  status: ReportStatus
): string => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "UNDER_INVESTIGATION":
      return "bg-blue-100 text-blue-700";

    case "AWAITING_USER_RESPONSE":
      return "bg-purple-100 text-purple-700";

    case "RESOLVED":
      return "bg-green-100 text-green-700";

    case "ESCALATED_TO_POLICE":
      return "bg-red-100 text-red-700";

    case "CLOSED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* =========================================================
   STATUS BADGE
   ========================================================= */

export default function ReportStatusBadge({
  status,
  statusDisplay,
}: ReportStatusBadgeProps) {
  const label =
    statusDisplay ||
    REPORT_STATUS_LABELS[status];

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
        status
      )}`}
    >
      {label}
    </span>
  );
}