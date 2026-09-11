import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminStats = {
  totalClients: number;
  totalLivreurs: number;
  livreursApprouves: number;
  livreursEnAttente: number;
  livreursRejetes: number;
  inscriptionsRecentes: {
    id: string;
    nom: string;
    prenom: string;
    role: "client" | "livreur";
    status: string;
    created_at: string;
  }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createAdminClient();

  const [
    { count: totalClients },
    { count: totalLivreurs },
    { count: livreursApprouves },
    { count: livreursEnAttente },
    { count: livreursRejetes },
    { data: recents },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "livreur"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "livreur")
      .eq("status", "approved"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "livreur")
      .eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "livreur")
      .eq("status", "rejected"),
    supabase
      .from("profiles")
      .select("id, nom, prenom, role, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    totalClients: totalClients ?? 0,
    totalLivreurs: totalLivreurs ?? 0,
    livreursApprouves: livreursApprouves ?? 0,
    livreursEnAttente: livreursEnAttente ?? 0,
    livreursRejetes: livreursRejetes ?? 0,
    inscriptionsRecentes: recents ?? [],
  };
}
