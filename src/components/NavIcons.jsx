import React from "react";

// 仲間 — infinity-loop body with two solid circle heads above
export function FriendsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="7" cy="5" r="2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="5" r="2" fill="currentColor" stroke="none" />
      <path d="M7 9 C3 9, 3 17, 8 17 C12 17, 12 9, 16 9 C20 9, 20 17, 17 17 C13 17, 13 9, 7 9" />
    </svg>
  );
}

// チャット — speech bubble with tail at bottom-left, three dots inside
export function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 3h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9l-5 4v-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <circle cx="8" cy="9.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="9.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// フィード — two overlapping rounded rectangles with list items
export function FeedIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="2" width="13" height="15" rx="2.5" />
      <rect x="3" y="7" width="13" height="15" rx="2.5" />
      <circle cx="7" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <line x1="9.5" y1="12" x2="13" y2="12" />
      <circle cx="7" cy="17" r="0.9" fill="currentColor" stroke="none" />
      <line x1="9.5" y1="17" x2="13" y2="17" />
    </svg>
  );
}