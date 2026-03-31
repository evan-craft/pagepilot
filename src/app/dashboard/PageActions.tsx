"use client";

import { useMemo, useState } from "react";

interface PageActionsProps {
  pageId: string;
  productName: string;
}

interface SavedPage {
  id: string;
  product_name: string;
  html: string;
}

export default function PageActions({ pageId, productName }: PageActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPage, setSavedPage] = useState<SavedPage | null>(null);

  const filename = useMemo(
    () => `${productName.toLowerCase().replace(/\s+/g, "-")}-landing.html`,
    [productName]
  );

  const loadPage = async () => {
    if (savedPage) return savedPage;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pages/${pageId}`);
      if (!res.ok) throw new Error("Failed to load page");
      const data = await res.json();
      setSavedPage(data.page);
      return data.page as SavedPage;
    } catch {
      setError("Couldn’t load this page right now.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    const page = await loadPage();
    if (!page) return;

    const w = window.open();
    if (w) {
      w.document.write(page.html);
      w.document.close();
    }
  };

  const handleDownload = async () => {
    const page = await loadPage();
    if (!page) return;

    const blob = new Blob([page.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handlePreview}
          disabled={loading}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Preview"}
        </button>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="px-3 py-2 bg-[#6c5ce7] rounded-lg text-xs text-white font-semibold hover:bg-[#5a4bd4] transition disabled:opacity-50"
        >
          Download HTML
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
