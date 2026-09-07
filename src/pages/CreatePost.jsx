import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, X, Loader2, Image as ImageIcon, Send } from "lucide-react";
import { useT } from "@/lib/i18n";
import { clearTimelineCache } from "@/lib/timelineScrollCache";
import { toast } from "@/components/ui/use-toast";

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CreatePost() {
  const t = useT();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [lastImageDate, setLastImageDate] = useState("");
  const anyUploading = mediaItems.some((it) => it.uploading);

  useEffect(() => {
    base44.auth.me().then((u) => setLastImageDate(u?.last_image_upload_date || "")).catch(() => {});
  }, []);

  const imageLocked = lastImageDate === getTodayStr();

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = "";
    if (mediaItems.length > 0) return;

    const imageFile = files.find((f) => f.type.startsWith("image/"));
    if (!imageFile) return;

    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      localUrl: URL.createObjectURL(imageFile),
      serverUrl: null,
      uploading: true,
      isVideo: false,
      file: imageFile,
    };
    setMediaItems([item]);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
      setMediaItems((prev) => prev.map((it) =>
        it.id === item.id ? { ...it, serverUrl: file_url, uploading: false } : it
      ));
    } catch {
      setMediaItems((prev) => prev.filter((it) => it.id !== item.id));
      URL.revokeObjectURL(item.localUrl);
    }
  }

  function tryOpenPicker() {
    if (imageLocked) {
      toast({ title: t("post.imageLimitToast") });
      return;
    }
    fileRef.current?.click();
  }

  async function save() {
    if (!content.trim() || anyUploading) return;
    const urls = mediaItems.map((it) => it.serverUrl).filter(Boolean);
    setSubmitting(true);
    try {
      await base44.entities.Post.create({
        content: content.trim(),
        is_anonymous: false,
        media_url: urls[0] || undefined,
        media_urls: JSON.stringify(urls),
        likes: 0,
        comments_count: 0
      });
      if (urls.length > 0) {
        await base44.auth.updateMe({ last_image_upload_date: getTodayStr() }).catch(() => {});
      }
      mediaItems.forEach((it) => { if (it.localUrl) URL.revokeObjectURL(it.localUrl); });
      clearTimelineCache();
      navigate("/timeline");
    } catch (err) {
      console.error("Post creation failed:", err);
      alert(t("common.networkError") || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
    mediaItems.forEach((it) => { if (it.localUrl) URL.revokeObjectURL(it.localUrl); });
    clearTimelineCache();
    navigate("/timeline");
  }

  const canSubmit = !!content.trim() && !anyUploading && !submitting;

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={save}
            disabled={!canSubmit}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-lg disabled:opacity-40 transition"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {t("post.submit")}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-5 px-4 py-4 max-w-2xl mx-auto w-full">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder={t("post.bodyPlaceholder")}
            className="flex-1 min-h-[8rem] w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
          />

        <div>
          {mediaItems.length > 0 ? (
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={item.localUrl} className="w-full h-full object-cover" alt="" />
                  {item.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (item.localUrl) URL.revokeObjectURL(item.localUrl);
                      setMediaItems((prev) => prev.filter((it) => it.id !== item.id));
                    }}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              onClick={tryOpenPicker}
              className={`mt-1.5 w-full flex items-center justify-center gap-2 border border-dashed rounded-lg py-4 text-sm transition ${
                imageLocked
                  ? "border-border text-muted-foreground/40 cursor-not-allowed"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              {t("post.addMedia")}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </div>
    </div>
  );
}