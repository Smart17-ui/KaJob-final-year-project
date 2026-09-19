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

  onChange: (
    field: keyof JobForm,
    value: string
  ) => void;

  onFlexibleChange: (
    value: boolean
  ) => void;

  onSkillsChange: (
    skillIds: number[]
  ) => void;

  onLocationChange: (
    latitude: number,
    longitude: number,
    accuracy?: number | null
  ) => void;

  onAddressChange: (
    location: string
  ) => void;
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
    <div className="flex min-h-0 w-full flex-1 flex-col">
      {/* Main Content */}
      <div className="min-h-0 w-full flex-1">
        <div
          className="
            flex
            h-full
            min-h-0
            w-full
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* Left Column */}
          <section
            className="
              min-h-0
              min-w-0
              w-[40%]
              shrink-0
              overflow-y-auto
              border-r
              border-slate-200
              bg-white
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

          {/* Right Column */}
          <section
            className="
              min-h-0
              min-w-0
              flex-1
              overflow-y-auto
              bg-slate-50
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

      {/* Sticky Bottom Action Bar */}
      <div
        className="
          sticky
          bottom-0
          z-20
          flex
          w-full
          shrink-0
          justify-end
          border-t
          border-slate-200
          bg-white
          px-6
          py-4
          shadow-[0_-4px_12px_rgba(0,0,0,0.04)]
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