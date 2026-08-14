export function isVideoUrl(url) {
  return /\.(mp4|mov|webm|avi)$/i.test(url || "");
}

export function getMediaUrls(post) {
  if (!post) return [];
  if (post.media_urls) {
    try {
      const arr = JSON.parse(post.media_urls);
      if (Array.isArray(arr)) return arr.filter(Boolean);
    } catch {}
  }
  return post.media_url ? [post.media_url] : [];
}