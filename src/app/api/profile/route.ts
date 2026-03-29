import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

  return NextResponse.json({ profile });
}
