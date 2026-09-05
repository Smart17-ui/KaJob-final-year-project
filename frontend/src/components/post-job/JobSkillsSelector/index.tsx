import type {
  SkillOption,
} from "../../types/job";

type JobSkillsSelectorProps = {
  skills: SkillOption[];

  selectedSkills: number[];

  onChange: (
    skillIds: number[]
  ) => void;
};

const JobSkillsSelector = ({
  skills,
  selectedSkills,
  onChange,
}: JobSkillsSelectorProps) => {
  const toggleSkill = (
    skillId: number
  ) => {
    if (
      selectedSkills.includes(skillId)
    ) {
      onChange(
        selectedSkills.filter(
          (id) => id !== skillId
        )
      );

      return;
    }

    onChange([
      ...selectedSkills,
      skillId,
    ]);
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Required skills
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select the skills a worker should have for this job.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
          <p className="text-sm font-medium text-gray-700">
            No skills available yet
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Skills will appear here once the skills
            endpoint is connected.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => {
              const selected =
                selectedSkills.includes(
                  skill.id
                );

              return (
                <label
                  key={skill.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    selected
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleSkill(
                        skill.id
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />

                  <span className="text-sm text-gray-800">
                    {skill.name}
                  </span>
                </label>
              );
            })}
          </div>

          {selectedSkills.length > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              {selectedSkills.length} skill
              {selectedSkills.length === 1
                ? ""
                : "s"} selected
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default JobSkillsSelector;