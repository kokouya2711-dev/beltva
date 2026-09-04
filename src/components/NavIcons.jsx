import React from "react";

// 仲間 — infinity loop body with two solid circle heads above (from IMG_2821)
export function FriendsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="2" fill="currentColor" stroke="none" />
      <path d="M12 11 C10.5 9, 6 9, 6 13 C6 17, 10.5 17, 12 15 C13.5 17, 18 17, 18 13 C18 9, 13.5 9, 12 11" />
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