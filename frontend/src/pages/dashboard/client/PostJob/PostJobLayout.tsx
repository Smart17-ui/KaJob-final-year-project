import PostJobSidebar from "./PostJobSidebar";

import JobLocationPicker from "@/components/post-job/JobLocationPicker";

import type {
  FormErrors,
  JobCategory,
  JobForm,
  SkillOption,
} from "@/shared/types/job";

type PostJobLayoutProps = {
  form: JobForm;
  errors: FormErrors;
  categories: JobCategory[];
  skills: SkillOption[];
  isSubmitting: boolean;
  isLoadingLookups?: boolean;
  onChange: (field: keyof JobForm, value: string) => void;
  onFlexibleChange: (value: boolean) => void;
  onSkillsChange: (skillIds: number[]) => void;
  onLocationChange: (
    latitude: number,
    longitude: number,
    accuracy?: number | null
  ) => void;
  onAddressChange: (location: string) => void;
};

const PostJobLayout = ({
  form,
  errors,
  categories,
  skills,
  isSubmitting,
  isLoadingLookups = false,
  onChange,
  onFlexibleChange,
  onSkillsChange,
  onLocationChange,
  onAddressChange,
}: PostJobLayoutProps) => {
  return (
    <div className="flex w-full flex-col">

      {/* =====================================================
          PAGE HEADER (desktop only)
      ===================================================== */}
      <div className="mb-6 hidden lg:block">
        <h1 className="text-2xl font-bold text-slate-900">
          Post a new job
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the details below and your job will be visible to workers
          in the selected area.
        </p>
      </div>

      {/* =====================================================
          MAIN WORKSPACE
      ===================================================== */}
      <div className="w-full">
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:min-h-[calc(100vh-260px)]
            w-full
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            lg:shadow-sm
          "
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}
          <section
            className="
              min-h-0
              min-w-0
              w-full
              lg:w-[45%]
              lg:max-w-[560px]
              lg:shrink-0
              overflow-y-auto
              border-b
              lg:border-b-0
              lg:border-r
              border-slate-200
              bg-slate-50/40
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {/* Sticky section label on desktop */}
            <div className="hidden lg:block border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Job information
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Details, schedule, and required skills
              </p>
            </div>

            <div className="p-4 sm:p-6 lg:p-7">
              <PostJobSidebar
                form={form}
                errors={errors}
                categories={categories}
                skills={skills}
                isLoadingLookups={isLoadingLookups}
                onChange={onChange}
                onFlexibleChange={onFlexibleChange}
                onSkillsChange={onSkillsChange}
              />
            </div>
          </section>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}
          <section
            className="
              min-h-0
              min-w-0
              w-full
              lg:flex-1
              overflow-y-auto
              bg-white
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {/* Sticky section label on desktop */}
            <div className="hidden lg:block border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Job location
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Where the job will take place
              </p>
            </div>

            <div className="p-4 sm:p-6 lg:p-7">
              <JobLocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                accuracy={form.locationAccuracy}
                location={form.location}
                onLocationChange={onLocationChange}
                onAddressChange={onAddressChange}
                error={errors.location}
              />
            </div>
          </section>
        </div>
      </div>

      {/* =====================================================
          ACTION BAR
      ===================================================== */}
      <div
        className="
          mt-4
          flex
          w-full
          items-center
          justify-between
          gap-4
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          py-3
          sm:px-6
          sm:py-4
        "
      >
        {/* Hint text — hidden on mobile */}
        <p className="hidden lg:block text-xs text-slate-500">
          Your job will be reviewed and published immediately.
        </p>

        <div className="flex w-full justify-end sm:w-auto">
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              inline-flex
              w-full
              sm:w-auto
              min-w-[150px]
              items-center
              justify-center
              rounded-xl
              bg-slate-900
              px-6
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isSubmitting ? "Posting…" : "Post Job"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostJobLayout;
