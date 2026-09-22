import {
  ChevronRightIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import type { MyReport } from "../../shared/types/report";

import ReportStatusBadge from "./ReportStatusBadge";

/* =========================================================
   PROPS
========================================================= */

interface MyReportCardProps {
  report: MyReport;
  onClick?: (report: MyReport) => void;
}

/* =========================================================
   DATE FORMATTER
========================================================= */

const formatSubmittedDate = (
  dateString: string
): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   MY REPORT CARD
========================================================= */

export default function MyReportCard({
  report,
  onClick,
}: MyReportCardProps) {
  const isGeneralComplaint =
    report.job_id === null ||
    report.job_id === undefined;

  return (
    <button
      type="button"
      onClick={() => onClick?.(report)}
      className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-300 hover:shadow-md"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <DocumentTextIcon className="h-5 w-5 text-gray-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Report
            </p>

            <h3 className="mt-0.5 text-sm font-semibold text-gray-900">
              {report.reference_number}
            </h3>
          </div>
        </div>

        <ReportStatusBadge
          status={report.status}
          statusDisplay={report.status_display}
        />
      </div>

      {/* ===================================================
          JOB / GENERAL COMPLAINT
      =================================================== */}

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {isGeneralComplaint
            ? "Complaint Type"
            : "Job"}
        </p>

        {isGeneralComplaint ? (
          <p className="mt-1 text-sm font-semibold text-gray-900">
            General Complaint
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {report.job_title ||
                "Job information unavailable"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Job #{report.job_id}
            </p>
          </>
        )}
      </div>

      {/* ===================================================
          REPORTED USER
      =================================================== */}

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
          <UserCircleIcon className="h-5 w-5 text-gray-500" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Reported User
          </p>

          <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
            {report.reported_user_name ||
              "Not specified"}
          </p>
        </div>
      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs text-gray-400">
            Category
          </p>

          <p className="mt-0.5 text-sm font-medium text-gray-700">
            {report.category_display}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-400">
              Submitted
            </p>

            <p className="mt-0.5 text-sm font-medium text-gray-700">
              {formatSubmittedDate(
                report.submitted_at
              )}
            </p>
          </div>

          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </button>
  );
}