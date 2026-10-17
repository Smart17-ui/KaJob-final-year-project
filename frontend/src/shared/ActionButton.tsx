import React from "react";

type Props = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const ActionButton = ({
  children,
  type = "button",
  onClick,
  loading = false,
  disabled = false,
}: Props) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="
        w-30 rounded-full
        bg-slate-900 px-4 py-2
        font-normal text-white
        transition-all duration-300 ease-in-out
        hover:-translate-y-0.5
        hover:shadow-lg hover:shadow-emerald-600/20
        active:translate-y-0 active:scale-95
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-emerald-600
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:hover:translate-y-0
        disabled:hover:bg-slate-900
        disabled:hover:shadow-none
      "
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};

export default ActionButton;