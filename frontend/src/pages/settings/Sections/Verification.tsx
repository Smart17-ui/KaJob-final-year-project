import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

/* =========================================================
   VERIFICATION SECTION
   ========================================================= */

const Verification = () => {
  return (
    <section className="w-full">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Verify Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Verify your identity to build trust and access all KaJob features.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="space-y-6 px-6 py-6 sm:px-8">

        {/* ===================================================
            VERIFICATION STATUS
        =================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                <ClockIcon className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Verification status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your account verification has not been completed yet.
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Pending
            </span>
          </div>
        </div>

        {/* ===================================================
            IDENTITY VERIFICATION
        =================================================== */}

        <div>
          <div className="mb-3">
            <h3 className="text-base font-semibold text-slate-900">
              Identity verification
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Upload a valid identification document to verify your identity.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            {/* NRC */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <IdentificationIcon className="h-5 w-5 text-slate-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    National Registration Card
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Upload the front and back of your NRC.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="
                  inline-flex shrink-0 items-center gap-2
                  rounded-lg
                  bg-emerald-600
                  px-3.5 py-2
                  text-sm font-medium
                  text-white
                  transition-colors
                  hover:bg-emerald-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500
                  focus:ring-offset-2
                "
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Upload
              </button>
            </div>

            {/* FRONT */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  NRC Front
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Front side of your identification card.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                <ExclamationCircleIcon className="h-4 w-4" />
                Not uploaded
              </span>
            </div>

            {/* BACK */}
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  NRC Back
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Back side of your identification card.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                <ExclamationCircleIcon className="h-4 w-4" />
                Not uploaded
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================
            WHY VERIFY
        =================================================== */}

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Why verify your identity?
              </h3>

              <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                <li>• Build trust with other KaJob users.</li>
                <li>• Show that your identity has been verified.</li>
                <li>• Access features that require a verified account.</li>
                <li>• Help keep the KaJob marketplace safer.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ===================================================
            SUBMIT BUTTON
        =================================================== */}

        <div className="flex justify-end border-t border-slate-200 pt-5">
          <button
            type="button"
            className="
              rounded-lg
              bg-emerald-600
              px-5 py-2.5
              text-sm font-semibold
              text-white
              transition-colors
              hover:bg-emerald-700
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              focus:ring-offset-2
            "
          >
            Submit for Verification
          </button>
        </div>

      </div>
    </section>
  );
};

export default Verification;