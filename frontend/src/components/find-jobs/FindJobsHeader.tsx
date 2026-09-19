import {
  ArrowPathIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  MapIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

type ViewMode = "list" | "map";

type FindJobsHeaderProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;

  radius: number;
  onRadiusChange: (radius: number) => void;

  selectedCategory: string;
  onCategoryChange: (category: string) => void;

  categories: string[];

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  jobsLoading: boolean;
  onRefresh: () => void;
};

const FindJobsHeader = ({
  searchQuery,
  setSearchQuery,
  radius,
  onRadiusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  viewMode,
  setViewMode,
  jobsLoading,
  onRefresh,
}: FindJobsHeaderProps) => {
  return (
    <header
      className="
        sticky
        top-[120px]
        z-30
        -mx-6
        border-b
        border-gray-200
        bg-white/95
        px-6
        py-3
        backdrop-blur
      "
    >
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {/* TITLE + DESCRIPTION */}

        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <h1 className="whitespace-nowrap text-xl font-bold tracking-tight text-gray-900">
            Find Jobs
          </h1>

          <span className="hidden text-gray-300 sm:inline">
            /
          </span>

          <p className="hidden whitespace-nowrap text-sm text-gray-500 lg:block">
            Find available work opportunities near you.
          </p>
        </div>

        {/* SEARCH */}

        <div className="relative min-w-[220px] flex-1 xl:max-w-[320px]">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search jobs..."
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        {/* RADIUS */}

        <div className="relative shrink-0">
          <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <select
            value={radius}
            onChange={(event) =>
              onRadiusChange(
                Number(event.target.value)
              )
            }
            className="h-9 w-[105px] appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-7 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          >
            <option value={0.5}>0.5 km</option>
            <option value={1}>1 km</option>
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
          </select>

          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            ▾
          </span>
        </div>

        {/* CATEGORY */}

        <div className="relative shrink-0">
          <select
            value={selectedCategory}
            onChange={(event) =>
              onCategoryChange(
                event.target.value
              )
            }
            className="h-9 w-[155px] appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-7 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          >
            <option value="all">
              All categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            ▾
          </span>
        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={onRefresh}
          disabled={jobsLoading}
          title="Refresh jobs"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${
              jobsLoading
                ? "animate-spin"
                : ""
            }`}
          />
        </button>

        {/* LIST / MAP */}

        <div className="ml-auto flex h-9 shrink-0 items-center rounded-lg border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() =>
              setViewMode("list")
            }
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
              viewMode === "list"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ListBulletIcon className="h-3.5 w-3.5" />
            List
          </button>

          <button
            type="button"
            onClick={() =>
              setViewMode("map")
            }
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
              viewMode === "map"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            Map
          </button>
        </div>
      </div>
    </header>
  );
};

export default FindJobsHeader;