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
      className="w-50 rounded-md bg-secondary-500 px-10 py-2 transition duration-300 hover:bg-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
};

export default ActionButton;