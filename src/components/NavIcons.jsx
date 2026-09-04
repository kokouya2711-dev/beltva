import React from "react";

// 仲間 — infinity loop body with two solid circle heads above (from IMG_2821)
export function FriendsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="7" cy="5" r="2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="5" r="2" fill="currentColor" stroke="none" />
      <path d="M7 9 C3 9, 3 17, 8 17 C12 17, 12 9, 16 9 C20 9, 20 17, 17 17 C13 17, 13 9, 7 9" />
    </svg>
  );
}

// フィード — main rectangle with list items + partial offset outer frame line
export function FeedIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 3 L15 3 Q17 3 17 5 L17 6" />
      <rect x="3" y="6" width="14" height="15" rx="2.5" />
      <circle cx="7" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <line x1="10" y1="11" x2="14" y2="11" />
      <circle cx="7" cy="16" r="1.1" fill="currentColor" stroke="none" />
      <line x1="10" y1="16" x2="14" y2="16" />
    </svg>
  );
}