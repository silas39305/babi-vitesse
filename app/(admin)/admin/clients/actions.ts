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

export async function suspendClient(clientId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", clientId)
    .eq("role", "client");

  if (error) {
    console.error(error);
    return { error: "Impossible de suspendre ce client." };
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/dashboard");

  return { success: true };
}

export async function reactivateClient(
  clientId: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", clientId)
    .eq("role", "client");

  if (error) {
    console.error(error);
    return { error: "Impossible de réactiver ce client." };
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/dashboard");

  return { success: true };
}
