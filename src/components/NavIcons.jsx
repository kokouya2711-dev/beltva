import React from "react";

// フィード — main rectangle with list items + partial offset outer frame line
export function FeedIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Partial outer frame (top + right edge, offset above-right) */}
      <path d="M7 3 L15 3 Q17 3 17 5 L17 6" />
      {/* Main rectangle */}
      <rect x="3" y="6" width="14" height="15" rx="2.5" />
      {/* List items: 2 bullets + 2 lines */}
      <circle cx="7" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <line x1="10" y1="11" x2="14" y2="11" />
      <circle cx="7" cy="16" r="1.1" fill="currentColor" stroke="none" />
      <line x1="10" y1="16" x2="14" y2="16" />
    </svg>
  );
}