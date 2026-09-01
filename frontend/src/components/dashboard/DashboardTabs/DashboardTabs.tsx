import {
  HomeIcon,
  BriefcaseIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

import { NavLink } from "react-router-dom";

type DashboardTabsProps = {
  role: "CLIENT" | "WORKER";
};

const DashboardTabs = ({ role }: DashboardTabsProps) => {
  const basePath =
    role === "CLIENT"
      ? "/client/dashboard"
      : "/worker/dashboard";

  const tabs =
    role === "CLIENT"
      ? [
          {
            name: "Overview",
            path: basePath,
            icon: HomeIcon,
            end: true,
          },
          {
            name: "My Jobs",
            path: `${basePath}/jobs`,
            icon: BriefcaseIcon,
          },
          {
            name: "Post Job",
            path: `${basePath}/post-job`,
            icon: PlusCircleIcon,
          },
          {
            name: "Applications",
            path: `${basePath}/applications`,
            icon: DocumentTextIcon,
          },
          {
            name: "Messages",
            path: `${basePath}/messages`,
            icon: ChatBubbleLeftRightIcon,
          },
          {
            name: "Analytics",
            path: `${basePath}/analytics`,
            icon: ChartBarIcon,
          },
        ]
      : [
          {
            name: "Overview",
            path: basePath,
            icon: HomeIcon,
            end: true,
          },
          {
            name: "Find Jobs",
            path: `${basePath}/jobs`,
            icon: BriefcaseIcon,
          },
          {
            name: "My Jobs",
            path: `${basePath}/my-jobs`,
            icon: BriefcaseIcon,
          },
          {
            name: "Applications",
            path: `${basePath}/applications`,
            icon: DocumentTextIcon,
          },
          {
            name: "Messages",
            path: `${basePath}/messages`,
            icon: ChatBubbleLeftRightIcon,
          },
          {
            name: "My Performance",
            path: `${basePath}/performance`,
            icon: TrophyIcon,
          },
        ];

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `
                flex shrink-0 items-center gap-2
                border-b-2 px-4 py-4
                text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "border-emerald-500 text-slate-900"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                }
                `
              }
            >
              <Icon className="h-4 w-4" />

              {tab.name}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardTabs;