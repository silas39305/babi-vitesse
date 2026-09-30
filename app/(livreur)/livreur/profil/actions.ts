"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { updateMonProfilLivreur } from "@/lib/livreur/profil";

type ActionResult = { error: string } | { success: true };

const TELEPHONE_REGEX = /^[0-9+ ]{8,15}$/;

export async function updateProfilLivreur(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "livreur") {
    return { error: "Accès refusé." };
  }

  const telephone = (formData.get("telephone") as string)?.trim();
  const whatsapp = (formData.get("whatsapp") as string)?.trim();
  const vehiculeType = (formData.get("vehicule_type") as string)?.trim();
  const vehiculePlaque = (formData.get("vehicule_plaque") as string)?.trim();

  if (!telephone || !whatsapp || !vehiculeType || !vehiculePlaque) {
    return { error: "Tous les champs sont obligatoires." };
  }
  if (!TELEPHONE_REGEX.test(telephone)) {
    return { error: "Numéro de téléphone invalide." };
  }
  if (!TELEPHONE_REGEX.test(whatsapp)) {
    return { error: "Numéro WhatsApp invalide." };
  }

  const ok = await updateMonProfilLivreur(session.userId, {
    telephone,
    whatsapp,
    vehicule_type: vehiculeType,
    vehicule_plaque: vehiculePlaque,
  });

  if (!ok) {
    return { error: "Impossible de mettre à jour le profil. Réessayez." };
  }

  revalidatePath("/livreur/profil");
  return { success: true };
}
