"use server";

import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";

type RegisterResult = { error: string } | { success: true; status: "approved" | "pending" };

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const role = formData.get("role") as "client" | "livreur";
  const nom = (formData.get("nom") as string)?.trim();
  const prenom = (formData.get("prenom") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim();
  const pin = (formData.get("pin") as string)?.trim();
  const adresse = (formData.get("adresse") as string)?.trim();

  // --- Validations de base ---
  if (!nom || !prenom || !telephone || !pin || !adresse) {
    return { error: "Tous les champs obligatoires doivent être remplis." };
  }
  if (!/^\d{6}$/.test(pin)) {
    return { error: "Le code PIN doit contenir exactement 6 chiffres." };
  }
  if (!/^[0-9+ ]{8,15}$/.test(telephone)) {
    return { error: "Numéro de téléphone invalide." };
  }

  const supabase = createAdminClient();

  // --- Vérifier que le téléphone n'est pas déjà utilisé ---
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("telephone", telephone)
    .maybeSingle();

  if (existing) {
    return { error: "Ce numéro de téléphone est déjà associé à un compte." };
  }

  const pinHash = await bcrypt.hash(pin, 10);

  if (role === "client") {
    const whatsapp = (formData.get("whatsapp") as string)?.trim();
    if (!whatsapp) {
      return { error: "Le numéro WhatsApp est obligatoire." };
    }

    const { error } = await supabase.from("profiles").insert({
      nom,
      prenom,
      telephone,
      whatsapp,
      adresse,
      pin_hash: pinHash,
      role: "client",
      status: "approved",
    });

    if (error) {
      console.error(error);
      return { error: "Erreur lors de la création du compte." };
    }

    return { success: true, status: "approved" };
  }

  // --- Livreur ---
  const dateNaissance = formData.get("date_naissance") as string;
  const contactUrgenceNom = (formData.get("contact_urgence_nom") as string)?.trim();
  const contactUrgenceTelephone = (formData.get("contact_urgence_telephone") as string)?.trim();
  const vehiculeType = formData.get("vehicule_type") as string;
  const vehiculePlaque = (formData.get("vehicule_plaque") as string)?.trim();

  if (
    !dateNaissance ||
    !contactUrgenceNom ||
    !contactUrgenceTelephone ||
    !vehiculeType ||
    !vehiculePlaque
  ) {
    return { error: "Tous les champs livreur sont obligatoires." };
  }

  // Vérifier la majorité (18 ans)
  const age = getAge(dateNaissance);
  if (age < 18) {
    return { error: "Vous devez avoir au moins 18 ans pour vous inscrire comme livreur." };
  }

  // --- Fichiers requis ---
  const pieceRecto = formData.get("piece_identite_recto") as File | null;
  const pieceVerso = formData.get("piece_identite_verso") as File | null;
  const selfie = formData.get("selfie") as File | null;
  const vehiculePhoto = formData.get("vehicule_photo") as File | null;
  const permis = formData.get("permis") as File | null;
  const carteGrise = formData.get("carte_grise") as File | null;

  const requiredFiles = { pieceRecto, pieceVerso, selfie, vehiculePhoto, permis, carteGrise };
  for (const [key, file] of Object.entries(requiredFiles)) {
    if (!file || file.size === 0) {
      return { error: `Le document "${key}" est manquant.` };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: `Le fichier "${key}" dépasse 5 Mo.` };
    }
  }

  // --- Upload des fichiers dans le bucket privé ---
  const folder = `${telephone.replace(/\D/g, "")}-${Date.now()}`;
  const uploads: Record<string, string> = {};

  const fileMap: [string, File][] = [
    ["piece_identite_recto", pieceRecto as File],
    ["piece_identite_verso", pieceVerso as File],
    ["selfie", selfie as File],
    ["vehicule_photo", vehiculePhoto as File],
    ["permis", permis as File],
    ["carte_grise", carteGrise as File],
  ];

  for (const [key, file] of fileMap) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${key}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("livreur-documents")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error(uploadError);
      return { error: `Échec de l'envoi du document "${key}".` };
    }

    uploads[`${key}_url`] = path; // on stocke le chemin, pas une URL publique (bucket privé)
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    nom,
    prenom,
    telephone,
    adresse,
    pin_hash: pinHash,
    role: "livreur",
    status: "pending",
    date_naissance: dateNaissance,
    contact_urgence_nom: contactUrgenceNom,
    contact_urgence_telephone: contactUrgenceTelephone,
    vehicule_type: vehiculeType,
    vehicule_plaque: vehiculePlaque,
    piece_identite_recto_url: uploads.piece_identite_recto_url,
    piece_identite_verso_url: uploads.piece_identite_verso_url,
    selfie_url: uploads.selfie_url,
    vehicule_photo_url: uploads.vehicule_photo_url,
    permis_url: uploads.permis_url,
    carte_grise_url: uploads.carte_grise_url,
  });

  if (insertError) {
    console.error(insertError);
    return { error: "Erreur lors de la création du compte." };
  }

  return { success: true, status: "pending" };
}

function getAge(dateNaissance: string): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
