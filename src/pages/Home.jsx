import React from "react";
import MyActivity from "@/components/activity/MyActivity";
import BodyPartRatioSection from "@/components/home/BodyPartRatioSection";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 space-y-10">
      {/* 📊 My Activity */}
      <section>
        <MyActivity />
      </section>
      <section>
        <BodyPartRatioSection />
      </section>
    </div>
  );
}