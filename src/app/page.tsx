import Link from "next/link";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] bg-clip-text text-transparent">
          ⚡ FastPage
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#a0a0b8]">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <Link href="/generate" className="px-4 py-2 bg-[#6c5ce7] text-white rounded-lg hover:bg-[#5a4bd4] transition font-medium">
            Get Started
          </Link>
        </div>
        <Link href="/generate" className="md:hidden px-4 py-2 bg-[#6c5ce7] text-white rounded-lg text-sm font-medium">
          Start
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-medium bg-[#6c5ce7]/10 text-[#a29bfe] rounded-full border border-[#6c5ce7]/20">
          🚀 AI-Powered Landing Pages
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Launch Pages{" "}
          <span className="bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] bg-clip-text text-transparent">
            10x Faster
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[#a0a0b8] mb-10 max-w-2xl mx-auto leading-relaxed">
          Describe your product, get a conversion-optimized landing page in seconds. 
          No design skills needed. No coding required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/generate"
            className="px-8 py-4 bg-[#6c5ce7] text-white rounded-xl text-lg font-semibold hover:bg-[#5a4bd4] transition shadow-lg shadow-[#6c5ce7]/25 hover:shadow-[#6c5ce7]/40"
          >
            Generate Your Page →
          </Link>
          <a
            href="#features"
            className="px-8 py-4 bg-white/5 text-white rounded-xl text-lg font-semibold hover:bg-white/10 transition border border-white/10"
          >
            See How It Works
          </a>
        </div>
        {/* Decorative glow */}
        <div className="relative mt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6c5ce7]/20 via-transparent to-[#a29bfe]/20 blur-3xl -z-10 h-64" />
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-6 text-left font-mono text-sm text-[#a0a0b8]">
              <p><span className="text-[#6c5ce7]">const</span> page = <span className="text-[#a29bfe]">await</span> fastpage.<span className="text-green-400">generate</span>({`{`}</p>
              <p className="pl-4">product: <span className="text-amber-300">&quot;My SaaS App&quot;</span>,</p>
              <p className="pl-4">description: <span className="text-amber-300">&quot;The best tool ever&quot;</span></p>
              <p>{`}`}); <span className="text-green-600">// ✨ Done in 3 seconds</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: "⚡",
    title: "Instant Generation",
    description: "Describe your product and get a fully designed landing page in under 10 seconds. AI handles layout, copy, and styling.",
  },
  {
    icon: "🎨",
    title: "Beautiful by Default",
    description: "Every generated page follows modern design principles — clean typography, proper spacing, and conversion-optimized layouts.",
  },
  {
    icon: "📱",
    title: "Mobile-First",
    description: "All pages are responsive out of the box. Perfect on desktop, tablet, and mobile — no manual tweaking needed.",
  },
  {
    icon: "🔧",
    title: "Export & Customize",
    description: "Download clean HTML/CSS code. Host anywhere — Vercel, Netlify, your own server. Full ownership of your pages.",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="text-[#a29bfe]">ship fast</span>
          </h2>
          <p className="text-[#a0a0b8] text-lg max-w-xl mx-auto">
            Stop spending days on landing pages. Let AI do the heavy lifting.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#12121a] border border-white/5 rounded-2xl p-8 hover:border-[#6c5ce7]/30 transition group"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#a29bfe] transition">
                {f.title}
              </h3>
              <p className="text-[#a0a0b8] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[#a0a0b8] text-lg">
            Start free. Upgrade when you need more.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-[#a0a0b8] mb-2">Free</h3>
            <div className="text-4xl font-bold mb-6">
              $0<span className="text-lg text-[#a0a0b8] font-normal">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-[#a0a0b8]">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 3 pages per month</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Basic templates</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> HTML export</li>
              <li className="flex items-center gap-2"><span className="text-[#a0a0b8]/40">✗</span> Custom branding</li>
            </ul>
            <Link
              href="/generate"
              className="block text-center px-6 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition border border-white/10"
            >
              Get Started Free
            </Link>
          </div>
          {/* Pro */}
          <div className="bg-[#12121a] border-2 border-[#6c5ce7] rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#6c5ce7] text-white text-xs font-bold rounded-full">
              POPULAR
            </div>
            <h3 className="text-lg font-semibold text-[#a29bfe] mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">
              $9<span className="text-lg text-[#a0a0b8] font-normal">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-[#a0a0b8]">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited pages</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Premium templates</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> HTML + React export</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom branding</li>
            </ul>
            <Link
              href="/generate"
              className="block text-center px-6 py-3 bg-[#6c5ce7] text-white rounded-xl font-medium hover:bg-[#5a4bd4] transition shadow-lg shadow-[#6c5ce7]/25"
            >
              Start Pro Trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#6c5ce7]/10 to-[#a29bfe]/5 border border-[#6c5ce7]/20 rounded-3xl p-12 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to launch?
        </h2>
        <p className="text-[#a0a0b8] text-lg mb-8 max-w-lg mx-auto">
          Join thousands of makers shipping landing pages in minutes, not days.
        </p>
        <Link
          href="/generate"
          className="inline-block px-8 py-4 bg-[#6c5ce7] text-white rounded-xl text-lg font-semibold hover:bg-[#5a4bd4] transition shadow-lg shadow-[#6c5ce7]/25 hover:shadow-[#6c5ce7]/40"
        >
          Generate Your Page Now →
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#a0a0b8]">
        <div className="font-semibold text-white">⚡ FastPage</div>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <Link href="/generate" className="hover:text-white transition">Generator</Link>
        </div>
        <div>© 2026 FastPage. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
