import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://odbwlruowbnnrjtzftsz.supabase.co";
const supabaseAnonKey = "sb_publishable_RMAPMEt1Co9m5R-1ggU3og_USsoVZxz";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
