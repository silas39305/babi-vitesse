import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type LivreurStatus = "approved" | "pending" | "rejected";

export type LivreurListItem = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  status: LivreurStatus;
  vehicule_type: string;
  created_at: string;
};

export type LivreurDetail = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  status: LivreurStatus;
  date_naissance: string;
  contact_urgence_nom: string;
  contact_urgence_telephone: string;
  vehicule_type: string;
  vehicule_plaque: string;
  created_at: string;
  documents: {
    label: string;
    url: string | null;
  }[];
};

const DOCUMENTS_BUCKET = "livreur-documents";
const SIGNED_URL_EXPIRY = 60 * 10; // 10 minutes, largement assez pour une revue admin

export async function getLivreurs(
  status?: LivreurStatus
): Promise<LivreurListItem[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, nom, prenom, telephone, status, vehicule_type, created_at"
    )
    .eq("role", "livreur")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getLivreurDetail(
  id: string
): Promise<LivreurDetail | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `id, nom, prenom, telephone, adresse, status, date_naissance,
       contact_urgence_nom, contact_urgence_telephone,
       vehicule_type, vehicule_plaque, created_at,
       piece_identite_recto_url, piece_identite_verso_url,
       selfie_url, vehicule_photo_url, permis_url, carte_grise_url`
    )
    .eq("role", "livreur")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(error);
    return null;
  }

  const docPaths: { label: string; path: string | null }[] = [
    { label: "Pièce d'identité (recto)", path: data.piece_identite_recto_url },
    { label: "Pièce d'identité (verso)", path: data.piece_identite_verso_url },
    { label: "Selfie", path: data.selfie_url },
    { label: "Photo du véhicule", path: data.vehicule_photo_url },
    { label: "Permis de conduire", path: data.permis_url },
    { label: "Carte grise", path: data.carte_grise_url },
  ];

  const documents = await Promise.all(
    docPaths.map(async ({ label, path }) => {
      if (!path) return { label, url: null };

      const { data: signed, error: signError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .createSignedUrl(path, SIGNED_URL_EXPIRY);

      if (signError) {
        console.error(signError);
        return { label, url: null };
      }

      return { label, url: signed.signedUrl };
    })
  );

  return {
    id: data.id,
    nom: data.nom,
    prenom: data.prenom,
    telephone: data.telephone,
    adresse: data.adresse,
    status: data.status,
    date_naissance: data.date_naissance,
    contact_urgence_nom: data.contact_urgence_nom,
    contact_urgence_telephone: data.contact_urgence_telephone,
    vehicule_type: data.vehicule_type,
    vehicule_plaque: data.vehicule_plaque,
    created_at: data.created_at,
    documents,
  };
}
