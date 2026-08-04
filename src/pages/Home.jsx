import React from "react";
import NearbyMap from "@/components/NearbyMap";
import RealtimeStatus from "@/components/RealtimeStatus";
import HomeTimeline from "@/components/HomeTimeline";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 space-y-10">
      {/* 🌍 World map — main hero */}
      <section>
        <RealtimeStatus />
        <NearbyMap />
      </section>

      {/* 📰 Timeline */}
      <section>
        <HomeTimeline />
      </section>
    </div>
  );
}