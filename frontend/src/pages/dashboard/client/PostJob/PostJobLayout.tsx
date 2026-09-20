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
  onChange,
  onFlexibleChange,
  onSkillsChange,
  onLocationChange,
  onAddressChange,
}: PostJobLayoutProps) => {
  return (
    <div className="flex w-full flex-col">
      {/* =====================================================
          MAIN POST JOB WORKSPACE
      ===================================================== */}
      <div className="w-full">
        <div
          className="
            flex
            min-h-[calc(100vh-220px)]
            w-full
            overflow-hidden
            rounded-xl
            border
            border-slate-200
          "
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}
          <section
            className="
              min-h-0
              min-w-0
              w-[40%]
              shrink-0
              overflow-y-auto
              border-r
              border-slate-200
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <div className="p-6">
              <PostJobSidebar
                form={form}
                errors={errors}
                categories={categories}
                skills={skills}
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
              flex-1
              overflow-y-auto
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <div className="p-6">
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
          justify-end
          rounded-xl
          border
          border-slate-200
          px-6
          py-4
        "
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            inline-flex
            min-w-[130px]
            items-center
            justify-center
            rounded-xl
            bg-slate-900
            px-5
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
          {isSubmitting ? "Posting..." : "Post Job"}
        </button>
      </div>
    </div>
  );
};

export default PostJobLayout;
