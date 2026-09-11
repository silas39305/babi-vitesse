import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfilClient = {
  id: string;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  whatsapp: string | null;
};

export async function getMonProfil(
  clientId: string
): Promise<ProfilClient | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nom, prenom, telephone, whatsapp")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(error);
    return null;
  }

  return data;
}

export async function updateMonProfil(
  clientId: string,
  input: { nom: string; prenom: string; telephone: string; whatsapp: string }
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      nom: input.nom,
      prenom: input.prenom,
      telephone: input.telephone,
      whatsapp: input.whatsapp,
    })
    .eq("id", clientId);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}
