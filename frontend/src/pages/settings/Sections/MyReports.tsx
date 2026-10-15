import {
  ArrowPathIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMyReportDetails,
  getMyReports,
} from "../../../components/services/reportService";

import type {
  MyReport,
  MyReportDetail,
} from "../../../shared/types/report";

import MyReportCard from "../../../components/reports/MyReportCard";
import ReportStatusBadge from "../../../components/reports/ReportStatusBadge";

/* =========================================================
   HELPERS
   ========================================================= */

const formatSubmittedDate = (
  dateString: string
): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/* =========================================================
   REPORT DETAILS MODAL
   ========================================================= */

interface ReportDetailsModalProps {
  report: MyReportDetail;
  onClose: () => void;
}

function ReportDetailsModal({
  report,
  onClose,
}: ReportDetailsModalProps) {
  /*
   * A "general complaint" has no job and no reported user,
   * so both of those sections need to render gracefully.
   */
  const isGeneralComplaint =
    report.job_id === null ||
    report.job_id === undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:rounded-2xl">

        {/* MODAL HEADER */}

        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <DocumentTextIcon className="h-6 w-6 text-gray-600" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Report
              </p>

              <h2 className="mt-1 text-lg font-semibold text-gray-900">
                {report.reference_number}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close report details"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL CONTENT */}

        <div className="space-y-5 p-5 sm:space-y-6 sm:p-6">

          {/* Status */}

          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Status
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Current status of your report
              </p>
            </div>

            <ReportStatusBadge
              status={report.status}
              statusDisplay={report.status_display}
            />
          </div>

          {/* Job / General Complaint */}

          {isGeneralComplaint ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Complaint Type
              </p>

              <div className="mt-2 rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  General Complaint
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Not related to a specific job
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Job
              </p>

              <div className="mt-2 rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  {report.job_title ||
                    "Job information unavailable"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Job #{report.job_id}
                </p>
              </div>
            </div>
          )}

          {/* Reported User */}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Reported User
            </p>

            <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                <UserCircleIcon className="h-6 w-6 text-gray-500" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {report.reported_user?.full_name ||
                    "Not specified"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {report.reported_user?.role === "WORKER"
                    ? "Worker"
                    : report.reported_user?.role === "CLIENT"
                    ? "Client"
                    : "General complaint"}
                </p>
              </div>
            </div>
          </div>

          {/* Category */}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Category
            </p>

            <div className="mt-2 rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900">
                {report.category_display}
              </p>
            </div>
          </div>

          {/* Description */}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Description
            </p>

            <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {report.description}
              </p>
            </div>
          </div>

          {/* Submitted Date */}

          <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Submitted
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {formatSubmittedDate(report.submitted_at)}
              </p>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}

        <div className="sticky bottom-0 border-t border-gray-100 bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] sm:p-6 sm:pb-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 sm:py-2.5"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MY REPORTS PAGE
   ========================================================= */

export default function MyReports() {
  const [reports, setReports] = useState<
    MyReport[]
  >([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  const [selectedReport, setSelectedReport] =
    useState<MyReportDetail | null>(null);

  const [loadingDetails, setLoadingDetails] =
    useState<boolean>(false);

  const [detailsError, setDetailsError] =
    useState<string>("");

  /* LOAD REPORTS */

  const loadReports = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMyReports();

        setReports(response.results || []);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load your reports.";

        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* INITIAL LOAD */

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /* OPEN REPORT DETAILS */

  const handleReportClick = async (
    report: MyReport
  ) => {
    try {
      setLoadingDetails(true);
      setDetailsError("");

      const response =
        await getMyReportDetails(report.id);

      setSelectedReport(response.report);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load report details.";

      setDetailsError(message);
    } finally {
      setLoadingDetails(false);
    }
  };

  /* CLOSE DETAILS */

  const handleCloseDetails = () => {
    setSelectedReport(null);
    setDetailsError("");
  };

  /* LOADING STATE */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            My Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View the complaints you have submitted and
            track their status.
          </p>
        </div>

        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />

            <p className="mt-3 text-sm text-gray-500">
              Loading your reports...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ERROR STATE */

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            My Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View the complaints you have submitted and
            track their status.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 text-red-500" />

            <div className="flex-1">
              <h2 className="text-sm font-semibold text-red-800">
                Unable to load your reports
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={loadReports}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <ArrowPathIcon className="h-4 w-4" />

                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* EMPTY STATE */

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            My Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View the complaints you have submitted and
            track their status.
          </p>
        </div>

        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <DocumentTextIcon className="h-7 w-7 text-gray-500" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-gray-900">
            No reports yet
          </h2>

          <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">
            You haven't submitted any complaints yet.
            Reports you submit about jobs will appear here.
          </p>
        </div>
      </div>
    );
  }

  /* MAIN PAGE */

  return (
    <>
      <div className="space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              My Reports
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View the complaints you have submitted and
              track their status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReports}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4" />

            Refresh
          </button>
        </div>

        {/* REPORT COUNT */}

        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-sm text-gray-500">
            You have{" "}
            <span className="font-semibold text-gray-900">
              {reports.length}
            </span>{" "}
            {reports.length === 1
              ? "report"
              : "reports"}.
          </p>
        </div>

        {/* DETAILS ERROR */}

        {detailsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to open report
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {detailsError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* REPORT CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          {reports.map((report) => (
            <MyReportCard
              key={report.id}
              report={report}
              onClick={handleReportClick}
            />
          ))}
        </div>

      </div>

      {/* LOADING DETAILS */}

      {loadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-5 shadow-xl">
            <ArrowPathIcon className="h-6 w-6 animate-spin text-gray-500" />

            <p className="text-sm font-medium text-gray-700">
              Loading report details...
            </p>
          </div>
        </div>
      )}

      {/* REPORT DETAILS */}

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
}
