import React from "react";

type SectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

const Section = ({
  title,
  description,
  action,
  children,
}: SectionProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      
      {/* Header */}
      {title && (
        <div className="border-b border-slate-100 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4 sm:px-8">
        {children}
      </div>

    </div>
  );
};

export default Section;
