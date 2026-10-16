import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

import type { VerificationStatusResponse } from "@/api/verification";

type PhoneVerificationCardProps = {
  verification: VerificationStatusResponse;
};

const PhoneVerificationCard = ({
  verification,
}: PhoneVerificationCardProps) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 opacity-75 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200">
        <DevicePhoneMobileIcon className="h-5 w-5 text-slate-500" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-700">
              Phone verification
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Phone number: {verification.phone_number || "Not added"}
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
            Planned
          </span>
        </div>

        <p className="mt-4 rounded-lg border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
          Phone OTP verification is planned. For now, verify your email and submit your identity documents to complete account verification.
        </p>
      </div>
    </div>
  </div>
);

export default PhoneVerificationCard;
