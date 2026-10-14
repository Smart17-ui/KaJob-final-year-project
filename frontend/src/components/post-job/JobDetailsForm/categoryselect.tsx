import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import type { JobCategory } from "../../../shared/types/job";

type CategorySelectProps = {
  value: string;
  categories: JobCategory[];
  isLoading?: boolean;
  hasError?: boolean;
  onChange: (value: string) => void;
};

const CategorySelect = ({
  value,
  categories,
  isLoading = false,
  hasError = false,
  onChange,
}: CategorySelectProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find(
    (c) => String(c.id) === value
  );

  const hasValue = Boolean(selectedCategory);

  /* -----------------------------------------
     Close on outside click
  ----------------------------------------- */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /* -----------------------------------------
     Close on Escape
  ----------------------------------------- */
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function handleSelect(categoryId: string) {
    onChange(categoryId);
    setOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !isLoading && setOpen((v) => !v)}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 ${
          hasValue ? "text-slate-900" : "text-slate-400"
        } ${
          hasError
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        }`}
      >
        <span className="truncate">
          {isLoading
            ? "Loading categories…"
            : selectedCategory?.name ?? "Select a category"}
        </span>

        <ChevronDownIcon
          className={`ml-2 h-4 w-4 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          } ${isLoading ? "text-slate-300" : "text-slate-400"}`}
        />
      </button>

      {/* Dropdown list */}
      {open && !isLoading && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {categories.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No categories available.
            </div>
          ) : (
            categories.map((category) => {
              const isSelected = String(category.id) === value;

              return (
                <button
                  key={category.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(String(category.id))}
                  className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-emerald-50 font-medium text-emerald-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
