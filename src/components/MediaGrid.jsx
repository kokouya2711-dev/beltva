import React, { useState } from "react";
import { Play } from "lucide-react";
import { isVideoUrl } from "@/lib/media";

function SingleMediaBlock({ url, onTap }) {
  const [ratio, setRatio] = useState(null);
  const isVideo = isVideoUrl(url);

  function handleLoad(e) {
    const t = e.target;
    const w = isVideo ? t.videoWidth : t.naturalWidth;
    const h = isVideo ? t.videoHeight : t.naturalHeight;
    if (w && h) setRatio(w / h);
  }

  let maxW = "100%";
  if (ratio !== null) {
    if (ratio < 0.8) maxW = "55%";
    else if (ratio < 1.3) maxW = "75%";
    else maxW = "100%";
  }

  return (
    <div className="mb-3 flex justify-start">
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer bg-secondary shrink-0"
        style={{ maxWidth: maxW }}
        onClick={(e) => { e.stopPropagation(); onTap?.(0); }}
      >
        {isVideo ? (
          <>
            <video
              src={url}
              onLoadedMetadata={handleLoad}
              className="max-h-[320px] max-w-full block bg-black"
              muted
              preload="metadata"
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-11 h-11 rounded-full bg-black/50 flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={url}
            onLoad={handleLoad}
            className="max-h-[320px] max-w-full block"
            alt=""
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

export default function MediaGrid({ mediaUrls, onTap }) {
  if (!mediaUrls || mediaUrls.length === 0) return null;
  const count = mediaUrls.length;

  if (count === 1) {
    return <SingleMediaBlock url={mediaUrls[0]} onTap={onTap} />;
  }

  let cols;
  if (count === 2) cols = 2;
  else if (count === 3) cols = 3;
  else if (count === 4) cols = 2;
  else cols = 3;

  return (
    <div className="mb-3 grid gap-1.5 w-fit max-w-full" style={{ gridTemplateColumns: `repeat(${cols}, 80px)` }}>
      {mediaUrls.slice(0, 9).map((url, i) => (
        <div key={i} className="relative aspect-square cursor-pointer rounded-lg overflow-hidden" onClick={(e) => { e.stopPropagation(); onTap?.(i); }}>
          {isVideoUrl(url) ? (
            <>
              <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                </div>
              </div>
            </>
          ) : (
            <img src={url} className="w-full h-full object-cover" alt="" loading="lazy" />
          )}
        </div>
      ))}
    </div>
  );
}