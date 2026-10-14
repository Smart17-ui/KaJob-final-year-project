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

  isLoadingLookups?: boolean;

  onChange: (field: keyof JobForm, value: string) => void;
  onFlexibleChange: (value: boolean) => void;
  onSkillsChange: (skillIds: number[]) => void;
};

const PostJobSidebar = ({
  form,
  errors,
  categories,
  skills,
  isLoadingLookups = false,
  onChange,
  onFlexibleChange,
  onSkillsChange,
}: PostJobSidebarProps) => {
  return (
    <div className="space-y-8 lg:space-y-10">

      {/* JOB DETAILS */}
      <section>
        <JobDetailsForm
          form={form}
          errors={errors}
          categories={categories}
          isLoadingLookups={isLoadingLookups}
          onChange={onChange}
        />
      </section>

      {/* SCHEDULE */}
      <section>
        <JobScheduleForm
          form={form}
          errors={errors}
          onChange={onChange}
          onFlexibleChange={onFlexibleChange}
        />
      </section>

      {/* REQUIRED SKILLS */}
      <section>
        <JobSkillsSelector
          skills={skills}
          selectedSkills={form.requiredSkills}
          isLoading={isLoadingLookups}
          onChange={onSkillsChange}
        />
      </section>
    </div>
  );
};

export default PostJobSidebar;
