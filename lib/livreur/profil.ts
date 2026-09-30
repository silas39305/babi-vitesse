import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfilLivreur = {
  id: string;
  nom: string;
  prenom: string | null;
  telephone: string;
  whatsapp: string | null;
  vehicule_type: string | null;
  vehicule_plaque: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  rejection_reason: string | null;
  piece_identite_recto_url: string | null;
  piece_identite_verso_url: string | null;
  selfie_url: string | null;
  permis_url: string | null;
  carte_grise_url: string | null;
  vehicule_photo_url: string | null;
};

const SELECT_FIELDS = `
  id, nom, prenom, telephone, whatsapp, vehicule_type, vehicule_plaque,
  status, rejection_reason, piece_identite_recto_url,
  piece_identite_verso_url, selfie_url, permis_url, carte_grise_url,
  vehicule_photo_url
`;

export async function getMonProfilLivreur(
  livreurId: string
): Promise<ProfilLivreur | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT_FIELDS)
    .eq("id", livreurId)
    .eq("role", "livreur")
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(error);
    return null;
  }

  return data as ProfilLivreur;
}

export async function updateMonProfilLivreur(
  livreurId: string,
  input: {
    telephone: string;
    whatsapp: string;
    vehicule_type: string;
    vehicule_plaque: string;
  }
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      telephone: input.telephone,
      whatsapp: input.whatsapp,
      vehicule_type: input.vehicule_type,
      vehicule_plaque: input.vehicule_plaque,
    })
    .eq("id", livreurId)
    .eq("role", "livreur");

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}
