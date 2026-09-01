import type { ComponentType } from "react";

type StatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconBackground: string;
  iconColor: string;
};

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconBackground,
  iconColor,
}: StatCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${iconBackground}`}
        >
          <Icon
            className={`h-6 w-6 ${iconColor}`}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
};

export default StatCard;