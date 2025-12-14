import React from "react";

export default function Chip({
  children,
  active = false,
  className = "",
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm border ${
        active
          ? "bg-[var(--color-primary)] text-white"
          : "bg-white text-[var(--color-secondary)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}
