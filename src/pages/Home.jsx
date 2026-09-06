import React from "react";
import MyActivity from "@/components/activity/MyActivity";
import BodyPartRatioSection from "@/components/home/BodyPartRatioSection";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8">
      {/* 📊 My Activity */}
      <section>
        <MyActivity />
      </section>
      <div className="h-px bg-border/70 my-6" />
      <section>
        <BodyPartRatioSection />
      </section>
    </div>
  );
}