"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { updateMonProfil } from "@/lib/client/profil";

type ActionResult = { error: string } | { success: true };

const TELEPHONE_REGEX = /^[0-9+ ]{8,15}$/;

export async function updateProfilClient(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "client") {
    return { error: "Accès refusé." };
  }

  const nom = (formData.get("nom") as string)?.trim();
  const prenom = (formData.get("prenom") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim();
  const whatsapp = (formData.get("whatsapp") as string)?.trim();

  if (!nom || !prenom || !telephone || !whatsapp) {
    return { error: "Tous les champs sont obligatoires." };
  }
  if (!TELEPHONE_REGEX.test(telephone)) {
    return { error: "Numéro de téléphone invalide." };
  }
  if (!TELEPHONE_REGEX.test(whatsapp)) {
    return { error: "Numéro WhatsApp invalide." };
  }

  const ok = await updateMonProfil(session.userId, {
    nom,
    prenom,
    telephone,
    whatsapp,
  });

  if (!ok) {
    return { error: "Impossible de mettre à jour le profil. Réessayez." };
  }

  // Le profil pré-remplit le formulaire de nouvelle commande et s'affiche
  // sur l'accueil : on revalide les deux.
  revalidatePath("/client/profil");
  revalidatePath("/client/commandes/nouvelle");
  revalidatePath("/client");

  return { success: true };
}
