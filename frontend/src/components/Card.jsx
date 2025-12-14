import React from "react";

export default function Card({ children, className = "", ...props }) {
  return (
    <div className={`card p-4 ${className} card-scale`} {...props}>
      {children}
    </div>
  );
}
