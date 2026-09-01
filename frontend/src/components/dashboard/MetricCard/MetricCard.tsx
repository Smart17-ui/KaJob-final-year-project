import React from "react";

type MetricCardProps = {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  chart?: React.ReactNode;
};

const MetricCard = ({
  label,
  value,
  change,
  isPositive = true,
  icon,
  chart,
}: MetricCardProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      
      {/* Header with Label and Icon */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </h3>
        {icon && (
          <div className="text-slate-400">
            {icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-3">
        <p className="text-3xl font-semibold text-slate-900">
          {value}
        </p>
      </div>

      {/* Change Indicator */}
      {change && (
        <p
          className={`text-sm font-medium ${
            isPositive
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {change}
        </p>
      )}

      {/* Chart (Optional) */}
      {chart && (
        <div className="mt-4">
          {chart}
        </div>
      )}

    </div>
  );
};

export default MetricCard;
