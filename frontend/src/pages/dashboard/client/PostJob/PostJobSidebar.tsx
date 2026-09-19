import JobDetailsForm from "@/components/post-job/JobDetailsForm";
import JobScheduleForm from "@/components/post-job/JobScheduleForm";
import JobSkillsSelector from "@/components/post-job/JobSkillsSelector";

import type {
  FormErrors,
  JobCategory,
  JobForm,
  SkillOption,
} from "@/shared/types/job";

type PostJobSidebarProps = {
  form: JobForm;
  errors: FormErrors;

  categories: JobCategory[];
  skills: SkillOption[];

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
};

const PostJobSidebar = ({
  form,
  errors,
  categories,
  skills,
  onChange,
  onFlexibleChange,
  onSkillsChange,
}: PostJobSidebarProps) => {
  return (
    <div className="space-y-8">
      {/* =====================================================
          JOB DETAILS
      ===================================================== */}

      <section>
        <JobDetailsForm
          form={form}
          errors={errors}
          categories={categories}
          onChange={onChange}
        />
      </section>

      {/* =====================================================
          SCHEDULE
      ===================================================== */}

      <section>
        <JobScheduleForm
          form={form}
          errors={errors}
          onChange={onChange}
          onFlexibleChange={onFlexibleChange}
        />
      </section>

      {/* =====================================================
          REQUIRED SKILLS
      ===================================================== */}

      <section>
        <JobSkillsSelector
          skills={skills}
          selectedSkills={form.requiredSkills}
          onChange={onSkillsChange}
        />
      </section>
    </div>
  );
};

export default PostJobSidebar;