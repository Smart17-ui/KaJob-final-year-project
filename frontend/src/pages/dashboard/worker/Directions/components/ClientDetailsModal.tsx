import {
  BriefcaseIcon,
  MapPinIcon,
  PhoneIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { Job } from "@/shared/types/job";

type WorkStatus =
  | "Assigned"
  | "In Progress"
  | "Awaiting Confirmation"
  | "Completed"
  | "Cancelled";

export type ClientDetailsWork = {
  id: number;
  job: Job;
  status: WorkStatus;
};

type ClientDetailsModalProps = {
  work: ClientDetailsWork;
  onClose: () => void;
};

const ClientDetailsModal = ({
  work,
  onClose,
}: ClientDetailsModalProps) => {
  const job = work.job;

  const clientName =
    job.client_name ||
    "Client";

  const clientPhone =
    job.client_phone ||
    null;

  const location =
    job.general_location ||
    "Location not specified";

  const handleCallClient = () => {
    if (!clientPhone) {
      return;
    }

    window.location.href =
      `tel:${clientPhone}`;
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-gray-950/50 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-details-title"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <UserCircleIcon className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h2
                id="client-details-title"
                className="text-lg font-bold text-gray-900"
              >
                Client Details
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Information for your assigned job
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close client details"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="space-y-4 p-6">
          {/* CLIENT */}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <UserCircleIcon className="h-5 w-5 text-gray-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Client
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                  {clientName}
                </p>
              </div>
            </div>
          </div>

          {/* PHONE */}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <PhoneIcon className="h-5 w-5 text-gray-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Phone
                </p>

                <p className="mt-0.5 text-sm font-semibold text-gray-900">
                  {clientPhone ||
                    "Phone number not available"}
                </p>
              </div>
            </div>
          </div>

          {/* LOCATION */}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                <MapPinIcon className="h-5 w-5 text-gray-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Job Location
                </p>

                <p className="mt-0.5 text-sm font-semibold leading-5 text-gray-900">
                  {location}
                </p>
              </div>
            </div>
          </div>

          {/* JOB */}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                <BriefcaseIcon className="h-5 w-5 text-gray-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Job
                </p>

                <p className="mt-0.5 text-sm font-semibold leading-5 text-gray-900">
                  {job.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            {clientPhone && (
              <button
                type="button"
                onClick={
                  handleCallClient
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <PhoneIcon className="h-4 w-4" />
                Call Client
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;