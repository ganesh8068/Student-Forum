import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full top-0 z-40 transition ${
        solid ? "bg-[var(--color-card)] shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-[var(--color-secondary)] font-semibold">
          Student Forum
        </Link>
        <div className="hidden md:flex gap-4 items-center">
          <Link to="/discussion-room" className="text-sm muted">
            Discussion
          </Link>
          <Link to="/resources" className="text-sm muted">
            Resources
          </Link>
          <Link to="/about" className="text-sm muted">
            About
          </Link>
          <Link to="/signin" className="text-sm btn-accent px-3 py-1 rounded">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
