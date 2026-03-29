"use client";

import { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="px-4 py-2 bg-[#6c5ce7] text-white rounded-lg text-sm font-semibold hover:bg-[#5a4bd4] transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Redirecting..." : "⚡ Upgrade to Pro"}
    </button>
  );
}
