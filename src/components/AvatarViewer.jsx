import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function AvatarViewer({ url, name, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 active:bg-white/20"
        aria-label="close"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <img
        src={url}
        alt={name || "avatar"}
        className="max-w-[90vw] max-h-[85vh] rounded-full object-cover"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}