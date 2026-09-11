"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { error: string } | { success: true };

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

  revalidatePath("/admin/livreurs");
  revalidatePath(`/admin/livreurs/${livreurId}`);
  revalidatePath("/admin/dashboard");

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

  revalidatePath("/admin/livreurs");
  revalidatePath(`/admin/livreurs/${livreurId}`);
  revalidatePath("/admin/dashboard");

  return { success: true };
}
