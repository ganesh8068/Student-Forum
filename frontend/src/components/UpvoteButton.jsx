import React, { useState } from "react";

export default function UpvoteButton({ initial = 0, onUpvote }) {
  const [count, setCount] = useState(initial);
  const [anim, setAnim] = useState(false);

  const handle = () => {
    setCount((c) => c + 1);
    setAnim(true);
    onUpvote?.();
    setTimeout(() => setAnim(false), 400);
  };

  return (
    <button
      onClick={handle}
      className={`flex items-center gap-2 px-3 py-1 rounded ${
        anim ? "scale-110" : ""
      } transition`}
    >
      <span className="text-[var(--color-primary)]">▲</span>
      <span>{count}</span>
    </button>
  );
}
