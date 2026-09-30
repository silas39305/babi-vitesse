"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { error: string } | { success: true };

async function requireLivreur() {
  const session = await getSession();
  if (!session || session.role !== "livreur") {
    return null;
  }
  return session;
}

function revalidateLivreurDashboard() {
  revalidatePath("/livreur/dashboard");
}

// Un livreur accepte une commande en attente : elle lui est assignée et
// passe au statut "acceptee". On ne fait confiance qu'aux conditions de la
// requête (statut encore en_attente ET pas déjà assignée) pour éviter que
// deux livreurs se l'approprient en même temps.
export async function accepterCommande(
  commandeId: string
): Promise<ActionResult> {
  const session = await requireLivreur();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .update({
      livreur_id: session.userId,
      statut: "acceptee",
    })
    .eq("id", commandeId)
    .eq("statut", "en_attente")
    .is("livreur_id", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { error: "Impossible d'accepter cette commande." };
  }
  if (!data) {
    return {
      error: "Cette commande a déjà été prise en charge par un autre livreur.",
    };
  }

  revalidateLivreurDashboard();
  return { success: true };
}

// Le livreur démarre la livraison (acceptee -> en_cours).
export async function demarrerLivraison(
  commandeId: string
): Promise<ActionResult> {
  const session = await requireLivreur();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .update({ statut: "en_cours" })
    .eq("id", commandeId)
    .eq("livreur_id", session.userId)
    .eq("statut", "acceptee")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { error: "Impossible de démarrer cette livraison." };
  }
  if (!data) {
    return { error: "Cette commande n'est plus dans l'état attendu." };
  }

  revalidateLivreurDashboard();
  return { success: true };
}

// Le livreur marque la commande comme livrée (en_cours -> livree).
export async function marquerLivree(
  commandeId: string
): Promise<ActionResult> {
  const session = await requireLivreur();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("commandes")
    .update({ statut: "livree" })
    .eq("id", commandeId)
    .eq("livreur_id", session.userId)
    .eq("statut", "en_cours")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { error: "Impossible de marquer cette commande comme livrée." };
  }
  if (!data) {
    return { error: "Cette commande n'est plus dans l'état attendu." };
  }

  revalidateLivreurDashboard();
  return { success: true };
  }
    
