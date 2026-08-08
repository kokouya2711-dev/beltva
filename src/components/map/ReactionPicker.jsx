import React from "react";

const REACTIONS = ["👍", "🔥", "💪", "❤️", "👏", "🎉"];

export default function ReactionPicker({ position, onSelect, onClose }) {
  return (
    <>
      {/* Overlay to catch outside taps */}
      <div
        className="absolute inset-0 z-[500]"
        onClick={onClose}
        onTouchStart={(e) => { e.preventDefault(); onClose(); }}
      />
      {/* Reaction pill, positioned above the marker */}
      <div
        className="absolute z-[510] glass rounded-full px-2 py-1.5 flex items-center gap-0.5 shadow-xl border border-border"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, calc(-100% - 16px))",
        }}
      >
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={(e) => { e.stopPropagation(); onSelect(emoji); }}
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); onSelect(emoji); }}
            className="text-2xl hover:scale-125 active:scale-90 transition-transform p-1 leading-none"
          >
            {emoji}
          </button>
        ))}
      </div>
      {/* Small downward arrow */}
      <div
        className="absolute z-[509]"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -16px)",
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "8px solid hsl(240 5% 10%)",
        }}
      />
    </>
  );
}