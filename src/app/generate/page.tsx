"use client";

import { useState } from "react";
import Link from "next/link";

export default function GeneratePage() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim() || !description.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setError(null);
    setLoading(true);
    setGeneratedHtml(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, description }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setGeneratedHtml(data.html);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] bg-clip-text text-transparent">
            ✈️ PagePilot
          </Link>
          <Link href="/" className="text-sm text-[#a0a0b8] hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Generate Your Landing Page
            </h1>
            <p className="text-[#a0a0b8] text-lg">
              Describe your product and we&apos;ll create a beautiful page instantly.
            </p>
          </div>

          {/* Form */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#a0a0b8]">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. TaskFlow"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder-[#a0a0b8]/50 focus:outline-none focus:border-[#6c5ce7] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[#a0a0b8]">
                  Product Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. An AI-powered project management tool that helps teams collaborate in real-time..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder-[#a0a0b8]/50 focus:outline-none focus:border-[#6c5ce7] transition resize-none"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-6 py-4 bg-[#6c5ce7] text-white rounded-xl font-semibold text-lg hover:bg-[#5a4bd4] transition shadow-lg shadow-[#6c5ce7]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "✨ Generate Landing Page"
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          {generatedHtml && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Preview</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedHtml], { type: "text/html" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${productName.toLowerCase().replace(/\s+/g, "-")}-landing.html`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                  >
                    ⬇️ Download HTML
                  </button>
                  <button
                    onClick={() => {
                      const w = window.open();
                      if (w) { w.document.write(generatedHtml); w.document.close(); }
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                  >
                    🔗 Open in New Tab
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <div className="bg-[#1a1a2e] px-4 py-2 flex gap-2 items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-xs text-[#a0a0b8]">{productName.toLowerCase().replace(/\s+/g, "-")}.com</span>
                </div>
                <iframe
                  srcDoc={generatedHtml}
                  className="w-full h-[600px] border-0"
                  title="Generated Landing Page Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
