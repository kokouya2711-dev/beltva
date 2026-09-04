import React from "react";

// 仲間 — infinity loop body with two solid circle heads above (from IMG_2821)
export function FriendsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="8" cy="5" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="5" r="2.2" fill="currentColor" stroke="none" />
      <path d="M12 13 C9.5 9.5, 5 9.5, 5 13 C5 16.5, 9.5 16.5, 12 13" />
      <path d="M12 13 C14.5 9.5, 19 9.5, 19 13 C19 16.5, 14.5 16.5, 12 13" />
    </svg>
  );
}

// チャット — rounded speech bubble with tail and three dots (from IMG_2822)
export function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7 Q3 4 6 4 L18 4 Q21 4 21 7 L21 13 Q21 16 18 16 L8 16 L4 20 L6 16 Q3 16 3 13 Z" />
      <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none" />
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