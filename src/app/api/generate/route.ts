import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an expert landing page designer and copywriter. Given a product name and description, generate a complete, beautiful, single-page HTML landing page.

Requirements:
- Self-contained HTML with inline CSS (no external dependencies)
- Modern, professional dark theme design
- Responsive (mobile-friendly)
- Include: hero section with headline + subheadline + CTA button, features section (4 features with icons), testimonials placeholder, pricing section (Free + Pro tiers), footer
- Use a cohesive color scheme with a vibrant accent color
- Clean typography, good spacing, subtle gradients and shadows
- The page should look production-ready, not like a template
- Use emoji for feature icons
- CTA buttons should be prominent and compelling
- Output ONLY the HTML code, no markdown, no explanation, no code fences`;

export async function POST(req: NextRequest) {
  try {
    const { productName, description } = await req.json();

    if (!productName || !description) {
      return NextResponse.json(
        { error: "Product name and description are required" },
        { status: 400 }
      );
    }

    // If no API key, return mock
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ html: getMockHtml(productName, description) });
    }

    const prompt = `Create a landing page for:
Product Name: ${productName}
Description: ${description}

Generate the complete HTML now.`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_PROMPT + "\n\n" + prompt }
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      // Fallback to mock on API error
      return NextResponse.json({ html: getMockHtml(productName, description) });
    }

    const data = await response.json();
    let html =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code fences if present
    html = html.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "").trim();

    if (!html || !html.includes("<")) {
      return NextResponse.json({ html: getMockHtml(productName, description) });
    }

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate landing page" },
      { status: 500 }
    );
  }
}

function getMockHtml(productName: string, description: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${productName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0f;color:#f0f0f5}
.hero{padding:120px 24px 80px;text-align:center;background:linear-gradient(135deg,#0a0a0f 0%,#1a1a2e 50%,#0a0a0f 100%)}
.hero h1{font-size:clamp(2.5rem,5vw,4.5rem);font-weight:800;margin-bottom:20px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:1.25rem;color:#a0a0b8;max-width:600px;margin:0 auto 40px;line-height:1.7}
.btn{display:inline-block;padding:16px 40px;background:#6c5ce7;color:white;border-radius:12px;text-decoration:none;font-weight:600;font-size:1.1rem;transition:all 0.3s;box-shadow:0 8px 30px rgba(108,92,231,0.3)}
.btn:hover{background:#5a4bd4;transform:translateY(-2px);box-shadow:0 12px 40px rgba(108,92,231,0.4)}
.features{padding:80px 24px;max-width:1100px;margin:0 auto}
.features h2{text-align:center;font-size:2.2rem;margin-bottom:50px}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.feature-card{background:#12121a;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:32px;transition:border-color 0.3s}
.feature-card:hover{border-color:rgba(108,92,231,0.3)}
.feature-card .icon{font-size:2.5rem;margin-bottom:16px}
.feature-card h3{font-size:1.2rem;margin-bottom:10px}
.feature-card p{color:#a0a0b8;line-height:1.6;font-size:0.95rem}
.pricing{padding:80px 24px;text-align:center}
.pricing h2{font-size:2.2rem;margin-bottom:50px}
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:700px;margin:0 auto}
.price-card{background:#12121a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px}
.price-card.pro{border:2px solid #6c5ce7}
.price-card h3{font-size:1.1rem;color:#a0a0b8;margin-bottom:8px}
.price-card .price{font-size:3rem;font-weight:800;margin-bottom:24px}
.price-card .price span{font-size:1rem;color:#a0a0b8;font-weight:400}
.price-card ul{list-style:none;text-align:left;margin-bottom:32px}
.price-card ul li{padding:8px 0;color:#a0a0b8;display:flex;align-items:center;gap:8px}
.price-card ul li::before{content:'✓';color:#6c5ce7;font-weight:bold}
footer{padding:40px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);color:#a0a0b8;font-size:0.9rem}
</style>
</head>
<body>
<section class="hero">
<h1>${productName}</h1>
<p>${description}</p>
<a href="#" class="btn">Get Started Free →</a>
</section>
<section class="features">
<h2>Why ${productName}?</h2>
<div class="features-grid">
<div class="feature-card"><div class="icon">⚡</div><h3>Lightning Fast</h3><p>Built for speed. Get results in seconds, not minutes.</p></div>
<div class="feature-card"><div class="icon">🎨</div><h3>Beautiful Design</h3><p>Stunning visuals that make your product shine.</p></div>
<div class="feature-card"><div class="icon">🔒</div><h3>Secure & Reliable</h3><p>Enterprise-grade security you can trust.</p></div>
<div class="feature-card"><div class="icon">🚀</div><h3>Scale Easily</h3><p>Grows with your business from day one.</p></div>
</div>
</section>
<section class="pricing">
<h2>Simple Pricing</h2>
<div class="pricing-grid">
<div class="price-card"><h3>Free</h3><div class="price">$0<span>/mo</span></div><ul><li>Basic features</li><li>Community support</li><li>3 projects</li></ul><a href="#" class="btn" style="background:rgba(255,255,255,0.05);box-shadow:none;border:1px solid rgba(255,255,255,0.1)">Start Free</a></div>
<div class="price-card pro"><h3>Pro</h3><div class="price">$9<span>/mo</span></div><ul><li>All features</li><li>Priority support</li><li>Unlimited projects</li><li>Custom branding</li></ul><a href="#" class="btn">Go Pro</a></div>
</div>
</section>
<footer>© 2026 ${productName}. All rights reserved.</footer>
</body>
</html>`;
}
