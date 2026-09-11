import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ZoneLivraison } from "@/lib/client/tarifs";

export type CommandeStatut =
  | "en_attente"
  | "acceptee"
  | "en_cours"
  | "livree"
  | "annulee";

export type CommandeListItem = {
  id: string;
  adresse_recuperation: string;
  commune: string;
  adresse_livraison: string;
  destinataire_nom: string;
  urgent: boolean;
  zone_prix: ZoneLivraison | null;
  prix_livraison: number | null;
  statut: CommandeStatut;
  livreur_nom: string | null;
  livreur_prenom: string | null;
  livreur_telephone: string | null;
  created_at: string;
};

export type CommandeDetail = CommandeListItem & {
  destinataire_telephone: string;
  client_numero: string;
  client_whatsapp: string;
  description_colis: string;
  notes: string | null;
  motif_annulation: string | null;
  updated_at: string;
};

const SELECT_FIELDS = `
  id, adresse_recuperation, commune, adresse_livraison, destinataire_nom,
  destinataire_telephone, client_numero, client_whatsapp, urgent,
  zone_prix, prix_livraison, description_colis, notes, statut,
  motif_annulation, created_at, updated_at,
  livreur:livreur_id ( nom, prenom, telephone )
`;

// Le client Supabase renvoie la relation imbriquée sous forme d'objet
// (parfois de tableau selon la version du typing) : on normalise ici.
function flattenLivreur(row: any) {
  const livreur = Array.isArray(row.livreur) ? row.livreur[0] : row.livreur;
  const { livreur: _omit, ...rest } = row;
  return {
    ...rest,
    livreur_nom: livreur?.nom ?? null,
    livreur_prenom: livreur?.prenom ?? null,
    livreur_telephone: livreur?.telephone ?? null,
  };
}

export async function getMesCommandes(
  clientId: string,
  statut?: CommandeStatut
): Promise<CommandeListItem[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("commandes")
    .select(SELECT_FIELDS)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (statut) {
    query = query.eq("statut", statut);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(flattenLivreur);
}

export async function getMaCommandeDetail(
  clientId: string,
  commandeId: string
): Promise<CommandeDetail | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .select(SELECT_FIELDS)
    .eq("client_id", clientId)
    .eq("id", commandeId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(error);
    return null;
  }

  return flattenLivreur(data);
}

export async function getNombreCommandesActives(
  clientId: string
): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("commandes")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .in("statut", ["en_attente", "acceptee", "en_cours"]);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}
