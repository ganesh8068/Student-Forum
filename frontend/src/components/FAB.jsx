import React from "react";

export default function FAB({ onClick, title = "Create Post" }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full p-4 bg-[var(--color-primary)] text-white shadow-lg hover:scale-105 transition"
    >
      {title}
    </button>
  );
}
