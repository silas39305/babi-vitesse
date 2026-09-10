import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client "admin" utilisant la service_role key.
// À utiliser UNIQUEMENT côté serveur (Server Actions, Route Handlers).
// Ne jamais importer ce fichier dans un composant "use client".
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
