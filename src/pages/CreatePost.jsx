import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, X, Loader2, Image as ImageIcon, Plus, Send } from "lucide-react";
import { POST_CATEGORIES, CATEGORY_STYLE } from "@/lib/community";
import WorkoutSelect from "@/components/WorkoutSelect";
import { useT } from "@/lib/i18n";
import { useTCategory } from "@/lib/i18nHelpers";
import { clearTimelineCache } from "@/lib/timelineScrollCache";

export default function CreatePost() {
  const t = useT();
  const tCat = useTCategory();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const anyUploading = mediaItems.some((it) => it.uploading);

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = "";

    const remaining = 9 - mediaItems.length;
    if (remaining <= 0) return;
    let toAdd = files.slice(0, remaining);

    const hasVideo = mediaItems.some((it) => it.isVideo);
    if (hasVideo) {
      toAdd = toAdd.filter((f) => !f.type.startsWith("video/"));
    } else {
      const videoFiles = toAdd.filter((f) => f.type.startsWith("video/"));
      if (videoFiles.length > 1) {
        const firstVideo = videoFiles[0];
        toAdd = toAdd.filter((f) => !f.type.startsWith("video/") || f === firstVideo);
      }
    }

    const newItems = toAdd.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      localUrl: URL.createObjectURL(f),
      serverUrl: null,
      uploading: true,
      isVideo: f.type.startsWith("video/"),
      file: f,
    }));
    setMediaItems((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
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
  }

  async function save() {
    if (!content.trim() || anyUploading) return;
    const urls = mediaItems.map((it) => it.serverUrl).filter(Boolean);
    setSubmitting(true);
    try {
      await base44.entities.Post.create({
        content: content.trim(),
        category: category || undefined,
        workout_type: workoutType || undefined,
        is_anonymous: false,
        media_url: urls[0] || undefined,
        media_urls: JSON.stringify(urls),
        likes: 0,
        comments_count: 0
      });
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
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 glass border-b border-border">
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

      <div className="flex-1 px-4 py-4 space-y-5 max-w-2xl mx-auto w-full pb-28">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.category")}</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {POST_CATEGORIES.map((c) => {
              const s = CATEGORY_STYLE[c];
              const selected = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(selected ? "" : c)}
                  className={`text-xs px-2 py-2 rounded-lg border transition ${selected ? `${s.bg} ${s.color} ${s.border}` : "border-border text-muted-foreground"}`}
                >
                  {tCat(c)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder={t("post.bodyPlaceholder")}
            className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.media")}</label>
          {mediaItems.length > 0 ? (
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                  {item.isVideo ? (
                    <video src={item.localUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.localUrl} className="w-full h-full object-cover" alt="" />
                  )}
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
              {mediaItems.length < 9 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-1.5 w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition"
            >
              <ImageIcon className="w-4 h-4" />
              {t("post.addMedia")}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFileSelect} className="hidden" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.bodyPart")}</label>
          <div className="mt-1.5">
            <WorkoutSelect value={workoutType} onChange={setWorkoutType} />
          </div>
        </div>
      </div>
    </div>
  );
}