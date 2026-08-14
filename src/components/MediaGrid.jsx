import React from "react";
import { Image } from "@/components/ui/image";
import { Play } from "lucide-react";
import { isVideoUrl } from "@/lib/media";

export default function MediaGrid({ mediaUrls, onTap }) {
  if (!mediaUrls || mediaUrls.length === 0) return null;
  const count = mediaUrls.length;

  if (count === 1) {
    const url = mediaUrls[0];
    return (
      <div className="mb-3 rounded-xl overflow-hidden cursor-pointer" onClick={(e) => { e.stopPropagation(); onTap?.(0); }}>
        {isVideoUrl(url) ? (
          <div className="relative aspect-[4/3] bg-black">
            <video src={url} className="w-full h-full object-cover" muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-[4/3]">
            <Image src={url} className="w-full h-full" fittingType="fill" />
          </div>
        )}
      </div>
    );
  }

  let cols;
  if (count === 2) cols = 2;
  else if (count === 3) cols = 3;
  else if (count === 4) cols = 2;
  else cols = 3;

  return (
    <div className="mb-3 grid gap-0.5 rounded-xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {mediaUrls.slice(0, 9).map((url, i) => (
        <div key={i} className="relative aspect-square cursor-pointer" onClick={(e) => { e.stopPropagation(); onTap?.(i); }}>
          {isVideoUrl(url) ? (
            <>
              <video src={url} className="w-full h-full object-cover" muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>
            </>
          ) : (
            <Image src={url} className="w-full h-full" fittingType="fill" />
          )}
        </div>
      ))}
    </div>
  );
}