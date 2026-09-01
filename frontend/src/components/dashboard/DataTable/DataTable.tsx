import type { ReactNode } from "react";

/* =========================
   TABLE COLUMN
========================= */

export type TableColumn<T> = {
  key: keyof T;
  label: string;

  render?: (
    value: T[keyof T],
    row: T
  ) => ReactNode;

  sortable?: boolean;

  align?: "left" | "center" | "right";
};

/* =========================
   DATA TABLE PROPS
========================= */

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];

  onRowClick?: (row: T) => void;

  emptyState?: ReactNode;
};

/* =========================
   DATA TABLE
========================= */

const DataTable = <
  T extends { id?: string | number }
>({
  columns,
  data,
  onRowClick,
  emptyState,
}: DataTableProps<T>) => {

  /* =========================
     ALIGNMENT
  ========================= */

  const getAlignClass = (
    align?: "left" | "center" | "right"
  ) => {
    if (align === "center") {
      return "text-center";
    }

    if (align === "right") {
      return "text-right";
    }

    return "text-left";
  };

  /* =========================
     EMPTY STATE
  ========================= */

  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        {emptyState ?? (
          <p className="text-sm text-slate-500">
            No data available
          </p>
        )}
      </div>
    );
  }

  /* =========================
     TABLE
  ========================= */

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full text-sm">

        {/* =========================
            TABLE HEADER
        ========================= */}

        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">

            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`px-6 py-3 font-semibold text-slate-700 ${getAlignClass(
                  column.align
                )}`}
              >
                <div
                  className={`flex items-center gap-2 ${
                    column.align === "center"
                      ? "justify-center"
                      : column.align === "right"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <span>
                    {column.label}
                  </span>

                  {column.sortable && (
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4"
                      />
                    </svg>
                  )}
                </div>
              </th>
            ))}

          </tr>
        </thead>

        {/* =========================
            TABLE BODY
        ========================= */}

        <tbody className="divide-y divide-slate-200">

          {data.map((row, index) => (
            <tr
              key={
                row.id !== undefined
                  ? row.id
                  : index
              }
              onClick={() =>
                onRowClick?.(row)
              }
              className={`transition-colors ${
                onRowClick
                  ? "cursor-pointer hover:bg-slate-50"
                  : ""
              }`}
            >

              {columns.map((column) => {
                const value =
                  row[column.key];

                return (
                  <td
                    key={String(
                      column.key
                    )}
                    className={`px-6 py-4 text-slate-700 ${getAlignClass(
                      column.align
                    )}`}
                  >
                    {column.render
                      ? column.render(
                          value,
                          row
                        )
                      : value !== null &&
                        value !== undefined
                      ? String(value)
                      : ""}
                  </td>
                );
              })}

            </tr>
          ))}

        </tbody>

      </table>
    </div>
  );
};

export default DataTable;