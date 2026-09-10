"use server";

import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSession } from "@/lib/auth/session";

type LoginResult =
  | { error: string }
  | { success: true; role: "client" | "livreur" | "admin" };

export async function loginUser(formData: FormData): Promise<LoginResult> {
  const telephone = (formData.get("telephone") as string)?.trim();
  const pin = (formData.get("pin") as string)?.trim();

  if (!telephone || !pin) {
    return { error: "Téléphone et PIN sont obligatoires." };
  }

  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, pin_hash, role, status, rejection_reason")
    .eq("telephone", telephone)
    .maybeSingle();

  // Message volontairement générique pour ne pas révéler si le téléphone existe
  if (error || !profile) {
    return { error: "Téléphone ou code PIN incorrect." };
  }

  const pinValid = await bcrypt.compare(pin, profile.pin_hash);
  if (!pinValid) {
    return { error: "Téléphone ou code PIN incorrect." };
  }

  // --- Vérification du statut du compte ---
  if (profile.status === "pending") {
    return {
      error:
        "Votre compte est en cours de vérification par un administrateur. Vous recevrez un SMS dès qu'il sera validé.",
    };
  }
  if (profile.status === "rejected") {
    return {
      error: profile.rejection_reason
        ? `Votre inscription a été refusée : ${profile.rejection_reason}`
        : "Votre inscription a été refusée. Contactez le support pour plus d'informations.",
    };
  }
  if (profile.status === "suspended") {
    return {
      error: "Votre compte a été suspendu. Contactez le support pour plus d'informations.",
    };
  }

  // status === "approved" → connexion autorisée
  await createSession({
    userId: profile.id,
    role: profile.role as "client" | "livreur" | "admin",
  });

  return { success: true, role: profile.role as "client" | "livreur" | "admin" };
}
