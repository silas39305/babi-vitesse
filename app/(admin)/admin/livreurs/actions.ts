"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { VEHICULE_TYPES } from "@/lib/admin/livreurs";

type ActionResult = { error: string } | { success: true };

function revalidateLivreur(livreurId: string) {
  revalidatePath("/admin/livreurs");
  revalidatePath(`/admin/livreurs/${livreurId}`);
  revalidatePath("/admin/dashboard");
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

export async function approveLivreur(livreurId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", livreurId)
    .eq("role", "livreur");

  if (error) {
    console.error(error);
    return { error: "Impossible d'approuver ce livreur." };
  }

  revalidateLivreur(livreurId);

  return { success: true };
}

export async function rejectLivreur(
  livreurId: string,
  motif?: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "rejected",
      rejection_reason: motif?.trim() || null,
    })
    .eq("id", livreurId)
    .eq("role", "livreur");

  if (error) {
    console.error(error);
    return { error: "Impossible de rejeter ce livreur." };
  }

  revalidateLivreur(livreurId);

  return { success: true };
}

export async function suspendLivreur(livreurId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  // On ne suspend qu'un livreur actuellement approuvé, pour éviter les
  // écrasements silencieux si son statut a changé entre-temps.
  const { data, error } = await supabase
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", livreurId)
    .eq("role", "livreur")
    .eq("status", "approved")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { error: "Impossible de suspendre ce livreur." };
  }
  if (!data) {
    return {
      error:
        "Ce livreur n'est plus au statut 'approuvé' — rechargez la page pour voir son statut actuel.",
    };
  }

  revalidateLivreur(livreurId);

  return { success: true };
}

export async function reactivateLivreur(
  livreurId: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", livreurId)
    .eq("role", "livreur")
    .eq("status", "suspended")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { error: "Impossible de réactiver ce livreur." };
  }
  if (!data) {
    return {
      error:
        "Ce livreur n'est plus au statut 'suspendu' — rechargez la page pour voir son statut actuel.",
    };
  }

  revalidateLivreur(livreurId);

  return { success: true };
}

export async function reopenLivreur(livreurId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  // Repasse un dossier rejeté en attente pour réexamen, et efface le motif
  // de rejet précédent puisqu'il ne s'applique plus.
  const { data, error } = await supabase
    .from("profiles")
    .update({ status: "pending", rejection_reason: null })
    .eq("id", livreurId)
    .eq("role", "livreur")
    .eq("status", "rejected")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return { error: "Impossible de repasser ce livreur en attente." };
  }
  if (!data) {
    return {
      error:
        "Ce livreur n'est plus au statut 'rejeté' — rechargez la page pour voir son statut actuel.",
    };
  }

  revalidateLivreur(livreurId);

  return { success: true };
}

export async function updateLivreurInfo(
  livreurId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const telephone = (formData.get("telephone") as string)?.trim();
  const vehiculeType = formData.get("vehicule_type") as string;
  const vehiculePlaque = (formData.get("vehicule_plaque") as string)?.trim();

  if (!telephone || !vehiculeType || !vehiculePlaque) {
    return { error: "Tous les champs sont obligatoires." };
  }
  if (!/^[0-9+ ]{8,15}$/.test(telephone)) {
    return { error: "Numéro de téléphone invalide." };
  }
  if (!VEHICULE_TYPES.includes(vehiculeType as (typeof VEHICULE_TYPES)[number])) {
    return { error: "Type de véhicule invalide." };
  }

  const supabase = createAdminClient();

  // Le téléphone doit rester unique sur l'ensemble des comptes.
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("telephone", telephone)
    .neq("id", livreurId)
    .maybeSingle();

  if (lookupError) {
    console.error(lookupError);
    return { error: "Impossible de vérifier le numéro de téléphone." };
  }
  if (existing) {
    return { error: "Ce numéro de téléphone est déjà associé à un autre compte." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      telephone,
      vehicule_type: vehiculeType,
      vehicule_plaque: vehiculePlaque,
    })
    .eq("id", livreurId)
    .eq("role", "livreur");

  if (error) {
    console.error(error);
    return { error: "Impossible de mettre à jour les informations." };
  }

  revalidateLivreur(livreurId);

  return { success: true };
}
