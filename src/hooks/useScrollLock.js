import { useEffect } from "react";

// 全画面オーバーレイ表示中に背景ページのスクロールを完全にロックする
// 開閉前後でスクロール位置を保持し、背面が動かないようにする
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;
    const prevTouchAction = body.style.touchAction;
    const scrollY = window.scrollY;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.touchAction = "none";

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevOverscroll;
      body.style.touchAction = prevTouchAction;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}