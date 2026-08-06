import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MyActivity from "@/components/activity/MyActivity";

export default function ActivityPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-secondary/40 mb-4">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <MyActivity />
    </div>
  );
}