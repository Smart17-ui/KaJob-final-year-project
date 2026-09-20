import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import type { Job } from "@/shared/types/job";

interface ClientDetailsCardProps {
  job: Job;
}

const ClientDetailsCard = ({
  job,
}: ClientDetailsCardProps) => {
  const clientName =
    job.client_name ||
    "Client details unavailable";

  const clientPhone =
    job.client_phone ||
    null;

  const clientEmail =
    job.client_email ||
    null;

  const location =
    job.exact_location ||
    job.general_location ||
    "Location not specified";

  const handleCallClient = () => {
    if (!clientPhone) {
      return;
    }

    window.location.href = `tel:${clientPhone}`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          <UserCircleIcon className="h-6 w-6 text-gray-700" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Client Details
          </h3>

          <p className="text-sm text-gray-500">
            Information about your client
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Client Name */}
        <div className="flex items-start gap-3">
          <UserCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Name
            </p>

            <p className="mt-1 truncate text-sm font-medium text-gray-900">
              {clientName}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Phone
            </p>

            {clientPhone ? (
              <button
                type="button"
                onClick={handleCallClient}
                className="mt-1 text-sm font-medium text-gray-900 transition hover:text-gray-700"
              >
                {clientPhone}
              </button>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Phone number unavailable
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        {clientEmail && (
          <div className="flex items-start gap-3">
            <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Email
              </p>

              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {clientEmail}
              </p>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Job Location
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {location}
            </p>
          </div>
        </div>
      </div>

      {/* Call Client */}
      {clientPhone && (
        <button
          type="button"
          onClick={handleCallClient}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99]"
        >
          <PhoneIcon className="h-5 w-5" />
          Call Client
        </button>
      )}
    </div>
  );
};

export default ClientDetailsCard;