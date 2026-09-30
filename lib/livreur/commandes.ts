import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ZoneLivraison } from "@/lib/client/tarifs";

export type CommandeStatut =
  | "en_attente"
  | "acceptee"
  | "en_cours"
  | "livree"
  | "annulee";

export type CommandeLivreurItem = {
  id: string;
  adresse_recuperation: string;
  commune: string;
  adresse_livraison: string;
  destinataire_nom: string;
  destinataire_telephone: string;
  urgent: boolean;
  zone_prix: ZoneLivraison | null;
  prix_livraison: number | null;
  description_colis: string;
  notes: string | null;
  statut: CommandeStatut;
  created_at: string;
};

export type CommandeLivreurDetail = CommandeLivreurItem & {
  livreur_id: string | null;
  updated_at: string;
};

const SELECT_FIELDS = `
  id, adresse_recuperation, commune, adresse_livraison, destinataire_nom,
  destinataire_telephone, urgent, zone_prix, prix_livraison,
  description_colis, notes, statut, created_at
`;

const SELECT_FIELDS_DETAIL = `${SELECT_FIELDS}, livreur_id, updated_at`;

// Commandes en attente, pas encore assignées à un livreur.
export async function getCommandesDisponibles(): Promise<
  CommandeLivreurItem[]
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .select(SELECT_FIELDS)
    .eq("statut", "en_attente")
    .is("livreur_id", null)
    .order("urgent", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as CommandeLivreurItem[];
}

// Commandes assignées à ce livreur et pas encore terminées.
export async function getMesCommandesLivreur(
  livreurId: string
): Promise<CommandeLivreurItem[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .select(SELECT_FIELDS)
    .eq("livreur_id", livreurId)
    .in("statut", ["acceptee", "en_cours"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as CommandeLivreurItem[];
}

// Historique des livraisons terminées (ou annulées) par ce livreur,
// les plus récentes en premier.
export async function getHistoriqueLivreur(
  livreurId: string
): Promise<CommandeLivreurItem[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .select(SELECT_FIELDS)
    .eq("livreur_id", livreurId)
    .in("statut", ["livree", "annulee"])
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as CommandeLivreurItem[];
}

// Une commande précise, visible par ce livreur seulement si elle lui est
// déjà assignée, ou si elle est encore disponible (en_attente, non assignée).
export async function getCommandeLivreur(
  commandeId: string,
  livreurId: string
): Promise<CommandeLivreurDetail | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .select(SELECT_FIELDS_DETAIL)
    .eq("id", commandeId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(error);
    return null;
  }

  const commande = data as CommandeLivreurDetail;

  const visible =
    commande.livreur_id === livreurId ||
    (commande.livreur_id === null && commande.statut === "en_attente");

  return visible ? commande : null;
}
