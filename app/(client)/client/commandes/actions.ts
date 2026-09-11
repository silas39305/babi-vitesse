"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculerPrixLivraison, getZoneForCommune } from "@/lib/client/tarifs";

const TELEPHONE_REGEX = /^[0-9+ ]{8,15}$/;

type ActionResult = { error: string } | { success: true };
type CreateCommandeResult = { error: string } | { success: true; id: string };

async function requireClient() {
  const session = await getSession();
  if (!session || session.role !== "client") {
    return null;
  }
  return session;
}

export async function createCommande(
  formData: FormData
): Promise<CreateCommandeResult> {
  const session = await requireClient();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const adresseRecuperation = (
    formData.get("adresse_recuperation") as string
  )?.trim();
  const commune = (formData.get("commune") as string)?.trim();
  const adresseLivraison = (formData.get("adresse_livraison") as string)?.trim();
  const destinataireNom = (formData.get("destinataire_nom") as string)?.trim();
  const destinataireTelephone = (
    formData.get("destinataire_telephone") as string
  )?.trim();
  const clientNumero = (formData.get("client_numero") as string)?.trim();
  const clientWhatsapp = (formData.get("client_whatsapp") as string)?.trim();
  const descriptionColis = (
    formData.get("description_colis") as string
  )?.trim();
  const notes = (formData.get("notes") as string)?.trim();
  const urgent = formData.get("urgent") === "on";

  if (
    !adresseRecuperation ||
    !commune ||
    !adresseLivraison ||
    !destinataireNom ||
    !destinataireTelephone ||
    !clientNumero ||
    !clientWhatsapp ||
    !descriptionColis
  ) {
    return { error: "Tous les champs obligatoires doivent être remplis." };
  }
  if (!TELEPHONE_REGEX.test(destinataireTelephone)) {
    return { error: "Numéro de téléphone du destinataire invalide." };
  }
  if (!TELEPHONE_REGEX.test(clientNumero)) {
    return { error: "Votre numéro de téléphone est invalide." };
  }
  if (!TELEPHONE_REGEX.test(clientWhatsapp)) {
    return { error: "Votre numéro WhatsApp est invalide." };
  }

  // Le prix est toujours recalculé côté serveur à partir de la commune :
  // on ne fait jamais confiance à un prix envoyé par le formulaire.
  const zone = getZoneForCommune(commune);
  const prixLivraison = calculerPrixLivraison(commune, urgent);
  if (!zone || prixLivraison === null) {
    return { error: "Commune invalide, merci d'en choisir une dans la liste." };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .insert({
      client_id: session.userId,
      adresse_recuperation: adresseRecuperation,
      commune,
      adresse_livraison: adresseLivraison,
      destinataire_nom: destinataireNom,
      destinataire_telephone: destinataireTelephone,
      client_numero: clientNumero,
      client_whatsapp: clientWhatsapp,
      description_colis: descriptionColis,
      notes: notes || null,
      urgent,
      zone_prix: zone,
      prix_livraison: prixLivraison,
      statut: "en_attente",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return { error: "Impossible de créer la commande. Réessayez." };
  }

  revalidatePath("/client");
  revalidatePath("/client/commandes");

  return { success: true, id: data.id };
}

export async function cancelCommande(
  commandeId: string,
  motif?: string
): Promise<ActionResult> {
  const session = await requireClient();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  // On n'autorise l'annulation que si la commande appartient bien au client
  // et n'est pas déjà en cours de livraison / livrée / annulée.
  const { data, error } = await supabase
    .from("commandes")
    .update({
      statut: "annulee",
      motif_annulation: motif?.trim() || null,
    })
    .eq("id", commandeId)
    .eq("client_id", session.userId)
    .in("statut", ["en_attente", "acceptee"])
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { error: "Impossible d'annuler cette commande." };
  }
  if (!data) {
    return {
      error:
        "Cette commande ne peut plus être annulée (elle est peut-être déjà en cours de livraison).",
    };
  }

  revalidatePath("/client");
  revalidatePath("/client/commandes");
  revalidatePath(`/client/commandes/${commandeId}`);

  return { success: true };
}
