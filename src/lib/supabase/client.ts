import { createBrowserClient } from "@supabase/ssr";

function createSafeStorage() {
  try {
    sessionStorage.setItem("_test", "1");
    sessionStorage.removeItem("_test");
    return undefined; // use default
  } catch {
    // sandboxed iframe or restricted context — fall back to in-memory
    const store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
    };
  }
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { storage: createSafeStorage() } }
  );
}
