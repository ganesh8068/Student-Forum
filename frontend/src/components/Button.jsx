import React from "react";

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-md transition";
  const variants = {
    primary: "btn-accent",
    secondary: "bg-white border border-gray-200 text-[var(--color-secondary)]",
    ghost: "bg-transparent text-[var(--color-primary)]",
  };

  return (
    <button
      className={`${base} ${
        variants[variant] || variants.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
