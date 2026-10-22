import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pdboziaqvnpkjxyfbndv.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_KnM2c78mu3gbBfPGg2q0ng_9Dg7vIx1";

// Client-side: anon key (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side only: service role key (bypasses RLS) - NEVER expose to client
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not set - server client unavailable");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

// Helper for server components/actions to get authenticated user
export const getServerUser = async () => {
  const serverClient = createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  return user;
};