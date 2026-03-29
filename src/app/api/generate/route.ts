import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash-preview-04-17";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const TEMPLATES: Record<string, { name: string; accentColor: string; bg: string; style: string }> = {
  saas: {
    name: "SaaS",
    accentColor: "#6c5ce7",
    bg: "#0a0a0f",
    style: "dark professional SaaS product — deep dark background, purple/indigo accent colors, clean B2B layout",
  },
  startup: {
    name: "Startup",
    accentColor: "#f97316",
    bg: "#0c0a00",
    style: "energetic startup — dark warm background, orange/amber accents, bold typography, high-energy vibe",
  },
  agency: {
    name: "Agency",
    accentColor: "#06b6d4",
    bg: "#020617",
    style: "premium agency — navy/dark blue background, cyan/teal accents, trust-building layout with social proof emphasis",
  },
  creator: {
    name: "Creator",
    accentColor: "#ec4899",
    bg: "#0a0010",
    style: "personal brand / creator — deep dark background, pink/rose gradients, modern and bold, creator economy vibe",
  },
  minimal: {
    name: "Minimal",
    accentColor: "#10b981",
    bg: "#050505",
    style: "ultra-minimal product — near-black background, green/emerald accents, clean whitespace, no clutter, Swiss design",
  },
};

const SYSTEM_PROMPT = (templateStyle: string, accentColor: string, bgColor: string) => `You are an expert landing page designer and conversion copywriter. Generate a complete, stunning HTML landing page.

DESIGN REQUIREMENTS:
- Self-contained HTML with ALL CSS inline in <style> tag (zero external dependencies)
- Background: ${bgColor}, Accent: ${accentColor}
- Style: ${templateStyle}
- Responsive mobile-first design with media queries
- Smooth CSS animations (fade-in on scroll via @keyframes + CSS classes, NO JS needed for animations)

REQUIRED SECTIONS (in order):
1. **Navbar** — Logo + nav links + CTA button (fixed, backdrop blur)
2. **Hero** — Big bold headline (2 lines max), subheadline, primary CTA + secondary CTA, hero visual/mockup (use pure CSS art or emoji composition)
3. **Social Proof Bar** — "Trusted by X+ users" + 3-4 company placeholder names in muted text
4. **Features** — 6 features in 3-column grid (icon + title + 2-line description)
5. **How It Works** — 3 numbered steps with connectors
6. **Testimonials** — 3 testimonial cards with name, role, avatar (initials placeholder), quote
7. **Pricing** — 3 tiers (Free / Pro $9 / Business $29), highlight middle tier
8. **FAQ** — 4 questions with answers
9. **CTA Banner** — Big bottom CTA section with gradient background
10. **Footer** — Links, copyright

COPY GUIDELINES:
- Headlines should be specific, benefit-driven, not generic
- Use power words: instant, effortless, powerful, zero X required
- CTAs: "Start for Free →", "See it in Action", "Get Started Free"
- Testimonials should feel real: specific names, roles, companies

CSS REQUIREMENTS:
- Use CSS custom properties (--accent, --bg, etc.)
- Smooth hover transitions on all interactive elements
- Card hover effects (lift + glow)
- Gradient text for headlines
- Section alternating subtle backgrounds for rhythm
- Mobile breakpoint at 768px

OUTPUT: ONLY the complete HTML. No markdown, no code fences, no explanation.`;

export async function POST(req: NextRequest) {
  try {
    const { productName, description, template = "saas" } = await req.json();

    if (!productName || !description) {
      return NextResponse.json(
        { error: "Product name and description are required" },
        { status: 400 }
      );
    }

    // Check auth and usage limits
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (user) {
      // Get or create profile
      let { data: profile } = await serviceSupabase
        .from("profiles")
        .select("plan, pages_used_this_month, pages_limit")
        .eq("id", user.id)
        .single();

      if (!profile) {
        const { data: newProfile } = await serviceSupabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            plan: "free",
            pages_used_this_month: 0,
            pages_limit: 3,
          })
          .select()
          .single();
        profile = newProfile;
      }

      // Check free tier limit
      if (profile && profile.plan !== "pro" && profile.pages_used_this_month >= profile.pages_limit) {
        return NextResponse.json({ error: "limit_reached" }, { status: 403 });
      }

      const tpl = TEMPLATES[template] || TEMPLATES.saas;
      const html = await generateHtml(productName, description, tpl);

      // Increment usage
      await serviceSupabase
        .from("profiles")
        .update({ pages_used_this_month: (profile?.pages_used_this_month ?? 0) + 1 })
        .eq("id", user.id);

      // Save page record
      await serviceSupabase.from("pages").insert({
        user_id: user.id,
        product_name: productName,
        description,
        template,
        html,
      });

      return NextResponse.json({ html });
    }

    // Unauthenticated user — generate without saving (frontend enforces 1-time limit)
    const tpl = TEMPLATES[template] || TEMPLATES.saas;
    const html = await generateHtml(productName, description, tpl);
    return NextResponse.json({ html });

  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate landing page" },
      { status: 500 }
    );
  }
}

async function generateHtml(
  productName: string,
  description: string,
  tpl: { name: string; accentColor: string; bg: string; style: string }
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return getMockHtml(productName, description, tpl.accentColor, tpl.bg);
  }

  const systemPrompt = SYSTEM_PROMPT(tpl.style, tpl.accentColor, tpl.bg);
  const userPrompt = `Product Name: ${productName}
Description: ${description}
Template style: ${tpl.name}

Generate the complete landing page HTML now. Make it specific to this product — use the product name and description to write real copy, not generic placeholders.`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 32768,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Gemini API error:", err);
    return getMockHtml(productName, description, tpl.accentColor, tpl.bg);
  }

  const data = await response.json();
  let html = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip markdown code fences
  html = html.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "").trim();

  if (!html || !html.includes("<html")) {
    return getMockHtml(productName, description, tpl.accentColor, tpl.bg);
  }

  return html;
}

function getMockHtml(productName: string, description: string, accent: string, bg: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${productName}</title>
<style>
:root{--accent:${accent};--bg:${bg};--card:#12121a;--text:#f0f0f5;--muted:#a0a0b8}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text)}
nav{position:fixed;top:0;width:100%;background:rgba(10,10,15,0.8);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.05);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;z-index:100}
.logo{font-weight:800;font-size:1.2rem;background:linear-gradient(135deg,var(--accent),#a29bfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.nav-cta{padding:8px 20px;background:var(--accent);color:white;border-radius:8px;font-size:.9rem;font-weight:600;text-decoration:none}
.hero{padding:130px 24px 80px;text-align:center;max-width:900px;margin:0 auto}
.hero h1{font-size:clamp(2.5rem,6vw,5rem);font-weight:900;line-height:1.1;margin-bottom:24px;background:linear-gradient(135deg,var(--text),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:1.2rem;color:var(--muted);max-width:600px;margin:0 auto 40px;line-height:1.7}
.cta-group{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-primary{padding:16px 36px;background:var(--accent);color:white;border-radius:12px;font-weight:700;font-size:1.1rem;text-decoration:none;transition:all .3s;box-shadow:0 8px 30px color-mix(in srgb,var(--accent) 35%,transparent)}
.btn-secondary{padding:16px 36px;background:rgba(255,255,255,.05);color:var(--text);border-radius:12px;font-weight:600;font-size:1.1rem;text-decoration:none;border:1px solid rgba(255,255,255,.1)}
.section{padding:80px 24px}
.section-inner{max-width:1100px;margin:0 auto}
.section-title{text-align:center;font-size:2.2rem;font-weight:800;margin-bottom:12px}
.section-sub{text-align:center;color:var(--muted);margin-bottom:60px;font-size:1.1rem}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.card{background:var(--card);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:32px;transition:all .3s}
.card:hover{border-color:color-mix(in srgb,var(--accent) 40%,transparent);transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.3)}
.card .icon{font-size:2.5rem;margin-bottom:16px}
.card h3{font-size:1.15rem;font-weight:700;margin-bottom:10px}
.card p{color:var(--muted);line-height:1.6;font-size:.95rem}
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;max-width:900px;margin:0 auto}
.price-card{background:var(--card);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:40px 32px;text-align:center}
.price-card.featured{border:2px solid var(--accent);position:relative}
.badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--accent);color:white;padding:4px 16px;border-radius:20px;font-size:.75rem;font-weight:700}
.price-card h3{font-size:1rem;color:var(--muted);margin-bottom:8px}
.price{font-size:3.5rem;font-weight:900;margin-bottom:6px}
.price small{font-size:1rem;color:var(--muted);font-weight:400}
.price-desc{color:var(--muted);font-size:.9rem;margin-bottom:28px}
.feature-list{list-style:none;text-align:left;margin-bottom:32px;space-y:8px}
.feature-list li{padding:8px 0;color:var(--muted);display:flex;align-items:center;gap:8px;font-size:.95rem;border-bottom:1px solid rgba(255,255,255,.04)}
.feature-list li::before{content:'✓';color:var(--accent);font-weight:700;flex-shrink:0}
.cta-section{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 15%,transparent),transparent);border:1px solid color-mix(in srgb,var(--accent) 20%,transparent);border-radius:24px;padding:80px 40px;text-align:center;max-width:800px;margin:0 auto}
footer{border-top:1px solid rgba(255,255,255,.05);padding:40px 24px;text-align:center;color:var(--muted);font-size:.9rem}
@media(max-width:768px){.features-grid,.pricing-grid{grid-template-columns:1fr}.cta-group{flex-direction:column;align-items:center}}
</style>
</head>
<body>
<nav>
  <span class="logo">✈️ ${productName}</span>
  <a href="#pricing" class="nav-cta">Get Started</a>
</nav>
<section class="hero">
  <h1>The Smarter Way to ${productName.split(' ')[0]}</h1>
  <p>${description}</p>
  <div class="cta-group">
    <a href="#pricing" class="btn-primary">Start for Free →</a>
    <a href="#features" class="btn-secondary">See How It Works</a>
  </div>
</section>
<section class="section">
  <div class="section-inner">
    <h2 class="section-title">Everything you need</h2>
    <p class="section-sub">Powerful features built for modern teams</p>
    <div class="features-grid">
      <div class="card"><div class="icon">⚡</div><h3>Blazing Fast</h3><p>Results in seconds. Built for speed from day one.</p></div>
      <div class="card"><div class="icon">🎨</div><h3>Beautiful Output</h3><p>Stunning results that make you look like a pro.</p></div>
      <div class="card"><div class="icon">📱</div><h3>Works Everywhere</h3><p>Responsive design, perfect on any device.</p></div>
      <div class="card"><div class="icon">🔒</div><h3>Secure by Default</h3><p>Enterprise-grade security. Your data stays yours.</p></div>
      <div class="card"><div class="icon">🔧</div><h3>Fully Customizable</h3><p>Tailor every aspect to match your brand.</p></div>
      <div class="card"><div class="icon">🚀</div><h3>Ship Faster</h3><p>Cut your workflow in half. Launch with confidence.</p></div>
    </div>
  </div>
</section>
<section class="section" style="background:rgba(255,255,255,.02)">
  <div class="section-inner">
    <h2 class="section-title">Simple, honest pricing</h2>
    <p class="section-sub">Start free. Upgrade when you're ready.</p>
    <div class="pricing-grid">
      <div class="price-card">
        <h3>Free</h3>
        <div class="price">$0<small>/mo</small></div>
        <p class="price-desc">Perfect to get started</p>
        <ul class="feature-list">
          <li>3 projects/month</li>
          <li>Basic features</li>
          <li>Community support</li>
        </ul>
        <a href="#" class="btn-secondary" style="display:block;text-align:center;padding:12px">Get Started Free</a>
      </div>
      <div class="price-card featured">
        <div class="badge">MOST POPULAR</div>
        <h3>Pro</h3>
        <div class="price">$9<small>/mo</small></div>
        <p class="price-desc">For serious makers</p>
        <ul class="feature-list">
          <li>Unlimited projects</li>
          <li>All features</li>
          <li>Priority support</li>
          <li>Custom branding</li>
        </ul>
        <a href="#" class="btn-primary" style="display:block;text-align:center;padding:12px">Start Pro Trial</a>
      </div>
      <div class="price-card">
        <h3>Business</h3>
        <div class="price">$29<small>/mo</small></div>
        <p class="price-desc">For growing teams</p>
        <ul class="feature-list">
          <li>Everything in Pro</li>
          <li>Team collaboration</li>
          <li>API access</li>
          <li>SLA guarantee</li>
        </ul>
        <a href="#" class="btn-secondary" style="display:block;text-align:center;padding:12px">Contact Sales</a>
      </div>
    </div>
  </div>
</section>
<section class="section">
  <div class="cta-section">
    <h2 style="font-size:2.5rem;font-weight:900;margin-bottom:16px">Ready to get started?</h2>
    <p style="color:var(--muted);font-size:1.1rem;margin-bottom:36px;max-width:500px;margin-left:auto;margin-right:auto">Join thousands of teams already using ${productName}. Setup takes under 2 minutes.</p>
    <a href="#" class="btn-primary">Start for Free — No Card Required</a>
  </div>
</section>
<footer>© 2026 ${productName}. All rights reserved.</footer>
</body>
</html>`;
}
