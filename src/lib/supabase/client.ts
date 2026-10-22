import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pdboziaqvnpkjxyfbndv.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_KnM2c78mu3gbBfPGg2q0ng_9Dg7vIx1";

export const supabase = createClient(supabaseUrl, supabaseKey);
