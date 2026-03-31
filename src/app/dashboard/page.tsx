import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import LogoutButton from "./LogoutButton";
import UpgradeButton from "./UpgradeButton";
import PageActions from "./PageActions";

interface Profile {
  id: string;
  email: string;
  plan: string;
  pages_used_this_month: number;
  pages_limit: number;
}

interface Page {
  id: string;
  product_name: string;
  description: string;
  template: string;
  created_at: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use service role for reading profile data to avoid RLS issues
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get or create profile
  let { data: profile } = await serviceSupabase
    .from("profiles")
    .select("*")
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

  // Get user's pages
  const { data: pages } = await serviceSupabase
    .from("pages")
    .select("id, product_name, description, template, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const typedProfile = profile as Profile;
  const typedPages = (pages || []) as Page[];
  const params = await searchParams;
  const justUpgraded = params?.upgraded === "1";

  const usagePercent = typedProfile
    ? Math.min(
        100,
        Math.round(
          (typedProfile.pages_used_this_month / typedProfile.pages_limit) * 100
        )
      )
    : 0;

  const isPro = typedProfile?.plan === "pro";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] bg-clip-text text-transparent"
          >
            ⚡ FastPage
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a0a0b8] hidden sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upgrade success banner */}
          {justUpgraded && (
            <div className="bg-green-400/10 border border-green-400/30 rounded-xl px-6 py-4 text-green-400 font-medium">
              🎉 You&apos;re now on Pro! Enjoy unlimited page generation.
            </div>
          )}

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-[#a0a0b8]">Welcome back, {user.email}</p>
          </div>

          {/* Usage Card */}
          <div
            className="rounded-2xl border border-white/10 p-6"
            style={{ background: "#12121a" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  This Month&apos;s Usage
                </h2>
                <p className="text-[#a0a0b8] text-sm mt-0.5">
                  {typedProfile?.pages_used_this_month ?? 0} /{" "}
                  {typedProfile?.pages_limit ?? 3} pages generated
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isPro
                      ? "bg-[#6c5ce7]/20 text-[#a29bfe] border border-[#6c5ce7]/30"
                      : "bg-white/5 text-[#a0a0b8] border border-white/10"
                  }`}
                >
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/5 rounded-full h-2.5 mb-4">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${usagePercent}%`,
                  background:
                    usagePercent >= 100
                      ? "#f87171"
                      : usagePercent >= 80
                      ? "#fb923c"
                      : "#6c5ce7",
                }}
              />
            </div>

            {!isPro && (
              <div className="flex items-center justify-between">
                <p className="text-[#a0a0b8] text-sm">
                  {typedProfile?.pages_limit
                    ? typedProfile.pages_limit -
                      typedProfile.pages_used_this_month
                    : 0}{" "}
                  pages remaining this month
                </p>
                <UpgradeButton />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/generate"
              className="px-6 py-3 bg-[#6c5ce7] text-white rounded-xl font-semibold hover:bg-[#5a4bd4] transition shadow-lg shadow-[#6c5ce7]/20"
            >
              ✨ Generate New Page
            </Link>
          </div>

          {/* Pages History */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Generated Pages
            </h2>
            {typedPages.length === 0 ? (
              <div
                className="rounded-2xl border border-white/10 border-dashed p-12 text-center"
                style={{ background: "#12121a" }}
              >
                <div className="text-4xl mb-3">✈️</div>
                <p className="text-white font-medium mb-1">No pages yet</p>
                <p className="text-[#a0a0b8] text-sm mb-4">
                  Generate your first landing page to see it here
                </p>
                <Link
                  href="/generate"
                  className="inline-block px-6 py-3 bg-[#6c5ce7] text-white rounded-xl font-semibold hover:bg-[#5a4bd4] transition text-sm"
                >
                  Generate First Page
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {typedPages.map((page) => (
                  <div
                    key={page.id}
                    className="rounded-xl border border-white/10 p-5 hover:border-[#6c5ce7]/40 transition"
                    style={{ background: "#12121a" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {page.product_name}
                        </h3>
                        <p className="text-[#a0a0b8] text-sm mt-1 line-clamp-2">
                          {page.description}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-[#a0a0b8] capitalize flex-shrink-0">
                        {page.template}
                      </span>
                    </div>
                    <p className="text-[#a0a0b8]/60 text-xs mt-3">
                      {new Date(page.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <PageActions
                      pageId={page.id}
                      productName={page.product_name}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
