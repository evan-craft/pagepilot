"use client";

import { useState } from "react";
import Link from "next/link";

const TEMPLATES = [
  { id: "saas", name: "SaaS", icon: "💻", desc: "Dark & professional" },
  { id: "startup", name: "Startup", icon: "🚀", desc: "Bold & energetic" },
  { id: "agency", name: "Agency", icon: "🏢", desc: "Premium & trust-building" },
  { id: "creator", name: "Creator", icon: "🎨", desc: "Personal & expressive" },
  { id: "minimal", name: "Minimal", icon: "⚡", desc: "Clean & focused" },
];

export default function GeneratePage() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("saas");
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [genTime, setGenTime] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim() || !description.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setError(null);
    setLoading(true);
    setGeneratedHtml(null);
    setGenTime(null);
    const t0 = Date.now();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, description, template }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setGeneratedHtml(data.html);
      setGenTime(Math.round((Date.now() - t0) / 100) / 10);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.toLowerCase().replace(/\s+/g, "-")}-landing.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenTab = () => {
    if (!generatedHtml) return;
    const w = window.open();
    if (w) { w.document.write(generatedHtml); w.document.close(); }
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

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              Generate Your Landing Page
            </h1>
            <p className="text-[#a0a0b8] text-lg">
              Pick a style, describe your product, get a beautiful page in seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
            {/* Left: Form */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8 space-y-6 lg:sticky lg:top-24">
              {/* Template Picker */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-white">
                  Choose a Style
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        template === t.id
                          ? "border-[#6c5ce7] bg-[#6c5ce7]/10 text-white"
                          : "border-white/10 bg-[#0a0a0f]/50 text-[#a0a0b8] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{t.name}</div>
                        <div className="text-xs opacity-70">{t.desc}</div>
                      </div>
                      {template === t.id && (
                        <span className="ml-auto text-[#6c5ce7] text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
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

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Product Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. An AI-powered project management tool that helps remote teams collaborate and ship faster..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white placeholder-[#a0a0b8]/50 focus:outline-none focus:border-[#6c5ce7] transition resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-6 py-4 bg-[#6c5ce7] text-white rounded-xl font-bold text-lg hover:bg-[#5a4bd4] transition shadow-lg shadow-[#6c5ce7]/25 hover:shadow-[#6c5ce7]/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating with AI...
                  </span>
                ) : (
                  "✨ Generate Landing Page"
                )}
              </button>

              {genTime && (
                <p className="text-center text-xs text-[#a0a0b8]">
                  ⚡ Generated in {genTime}s
                </p>
              )}
            </div>

            {/* Right: Preview */}
            <div className="min-h-[400px]">
              {!generatedHtml && !loading && (
                <div className="h-full min-h-[400px] flex items-center justify-center bg-[#12121a] border border-white/10 border-dashed rounded-2xl">
                  <div className="text-center text-[#a0a0b8]">
                    <div className="text-5xl mb-4">✈️</div>
                    <p className="font-medium text-white mb-1">Your page will appear here</p>
                    <p className="text-sm">Fill in the form and hit Generate</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="h-full min-h-[400px] flex items-center justify-center bg-[#12121a] border border-white/10 rounded-2xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-6">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full bg-[#6c5ce7] animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <p className="text-white font-medium">AI is designing your page...</p>
                    <p className="text-[#a0a0b8] text-sm mt-1">This takes 5–15 seconds</p>
                  </div>
                </div>
              )}

              {generatedHtml && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-xl font-bold text-white">Preview</h2>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={handleOpenTab}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white"
                      >
                        🔗 Full Screen
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-[#6c5ce7] text-white rounded-lg text-sm font-semibold hover:bg-[#5a4bd4] transition"
                      >
                        ⬇️ Download HTML
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <div className="bg-[#1a1a2e] px-4 py-2.5 flex gap-2 items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-green-500/70" />
                      <span className="ml-3 text-xs text-[#a0a0b8] font-mono">
                        {productName.toLowerCase().replace(/\s+/g, "-")}.com
                      </span>
                    </div>
                    <iframe
                      srcDoc={generatedHtml}
                      className="w-full h-[700px] border-0"
                      title="Generated Landing Page Preview"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
