import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la service_role key: bypassa RLS. Solo se importa en código server-side
// (Route Handlers / Server Actions), nunca en componentes "use client".
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
