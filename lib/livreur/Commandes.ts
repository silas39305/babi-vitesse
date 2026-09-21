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

const SELECT_FIELDS = `
  id, adresse_recuperation, commune, adresse_livraison, destinataire_nom,
  destinataire_telephone, urgent, zone_prix, prix_livraison,
  description_colis, notes, statut, created_at
`;

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
    
