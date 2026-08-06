import React from "react";
import { Dumbbell, Timer } from "lucide-react";
import { useTraining } from "@/lib/trainingContext";

export default function TrainingFloatingBar({ onClick }) {
  const { isActive, elapsedSec, restRemaining, restRunning } = useTraining();
  if (!isActive) return null;

  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const ss = String(elapsedSec % 60).padStart(2, "0");
  const rmm = String(Math.floor(restRemaining / 60)).padStart(2, "0");
  const rss = String(restRemaining % 60).padStart(2, "0");

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition ${restRunning ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}
    >
      <Dumbbell className="w-4 h-4" />
      <span className="text-sm font-bold tabular-nums">{mm}:{ss}</span>
      {restRunning && (
        <span className="flex items-center gap-1 text-sm bg-black/20 px-2 py-0.5 rounded-full tabular-nums">
          <Timer className="w-3 h-3" /> {rmm}:{rss}
        </span>
      )}
    </button>
  );
}