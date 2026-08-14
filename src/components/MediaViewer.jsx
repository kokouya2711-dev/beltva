import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { isVideoUrl } from "@/lib/media";

export default function MediaViewer({ mediaUrls, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const scrollRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (scrollRef.current && startIndex > 0) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = startIndex * scrollRef.current.clientWidth;
        }
      });
    }
  }, []);

  // Push history state so browser back closes the viewer instead of navigating away
  useEffect(() => {
    window.history.pushState({ mediaViewer: true }, "");
    const onPopState = () => onCloseRef.current();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function handleClose() {
    window.history.back();
  }

  function handleScroll() {
    if (!scrollRef.current) return;
    const i = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    if (i !== index) setIndex(i);
  }

  function scrollTo(i) {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: "smooth" });
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <button onClick={handleClose} className="p-2 -ml-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
        <span className="text-white/80 text-sm font-medium">{index + 1} / {mediaUrls.length}</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {mediaUrls.length === 1 ? (
          <SingleMedia url={mediaUrls[0]} />
        ) : (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
          >
            {mediaUrls.map((url, i) => (
              <div key={i} className="min-w-full h-full flex items-center justify-center snap-center shrink-0 px-4">
                <SingleMedia url={url} />
              </div>
            ))}
          </div>
        )}
      </div>

      {mediaUrls.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {mediaUrls.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SingleMedia({ url }) {
  if (isVideoUrl(url)) {
    return <video src={url} controls autoPlay playsInline className="max-h-full max-w-full object-contain" />;
  }
  return <img src={url} className="max-h-full max-w-full object-contain" alt="" />;
}