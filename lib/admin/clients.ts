import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ClientStatus = "approved" | "suspended";

export type ClientListItem = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  whatsapp: string;
  status: ClientStatus;
  created_at: string;
};

export type ClientDetail = ClientListItem & {
  adresse: string;
};

export async function getClients(
  status?: ClientStatus,
  search?: string
): Promise<ClientListItem[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("profiles")
    .select("id, nom, prenom, telephone, whatsapp, status, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (search && search.trim().length > 0) {
    const term = search.trim();
    // Recherche sur nom, prénom ou téléphone
    query = query.or(
      `nom.ilike.%${term}%,prenom.ilike.%${term}%,telephone.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getClientDetail(
  id: string
): Promise<ClientDetail | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, nom, prenom, telephone, whatsapp, adresse, status, created_at"
    )
    .eq("role", "client")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(error);
    return null;
  }

  return data;
}
