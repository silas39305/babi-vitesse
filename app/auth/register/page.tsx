"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "./actions";

export default function RegisterPage() {
  const [role, setRole] = useState<"client" | "livreur">("client");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState<"approved" | "pending" | null>(null);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const pin = formData.get("pin") as string;
    const pinConfirm = formData.get("pin_confirm") as string;

    if (pin !== pinConfirm) {
      setError("Les deux codes PIN ne correspondent pas.");
      setLoading(false);
      return;
    }

    const result = await registerUser(formData);

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.status === "approved") {
      router.push("/auth/login?inscription=reussie");
    } else {
      setSuccessStatus("pending");
      setLoading(false);
    }
  }

  if (successStatus === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Inscription envoyée ✅</h1>
          <p className="text-gray-600">
            Votre compte livreur est en cours de vérification. Vous recevrez un
            SMS dès que votre compte sera validé par un administrateur.
          </p>
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-4 py-8"
      >
        <h1 className="text-2xl font-bold">Inscription</h1>

        {/* Choix du rôle */}
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as "client" | "livreur")}
          className="w-full rounded border px-3 py-2"
        >
          <option value="client">Client</option>
          <option value="livreur">Livreur</option>
        </select>

        {/* --- Champs communs --- */}
        <div className="grid grid-cols-2 gap-3">
          <input
            name="nom"
            type="text"
            placeholder="Nom"
            className="w-full rounded border px-3 py-2"
            required
          />
          <input
            name="prenom"
            type="text"
            placeholder="Prénom"
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <input
          name="telephone"
          type="tel"
          placeholder="Numéro de téléphone"
          className="w-full rounded border px-3 py-2"
          required
        />

        <input
          name="adresse"
          type="text"
          placeholder="Adresse de résidence"
          className="w-full rounded border px-3 py-2"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            pattern="\d{6}"
            placeholder="PIN (6 chiffres)"
            className="w-full rounded border px-3 py-2"
            required
          />
          <input
            name="pin_confirm"
            type="password"
            inputMode="numeric"
            maxLength={6}
            pattern="\d{6}"
            placeholder="Confirmer le PIN"
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        {/* --- Champs spécifiques client --- */}
        {role === "client" && (
          <input
            name="whatsapp"
            type="tel"
            placeholder="Numéro WhatsApp"
            className="w-full rounded border px-3 py-2"
            required
          />
        )}

        {/* --- Champs spécifiques livreur --- */}
        {role === "livreur" && (
          <div className="space-y-4 rounded border border-dashed p-4">
            <p className="text-sm font-medium text-gray-700">
              Informations livreur (validation requise)
            </p>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Date de naissance
              </label>
              <input
                name="date_naissance"
                type="date"
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                name="contact_urgence_nom"
                type="text"
                placeholder="Contact d'urgence (nom)"
                className="w-full rounded border px-3 py-2"
                required
              />
              <input
                name="contact_urgence_telephone"
                type="tel"
                placeholder="Téléphone du contact"
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>

            <select
              name="vehicule_type"
              className="w-full rounded border px-3 py-2"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Type de véhicule
              </option>
              <option value="moto">Moto</option>
              <option value="velo">Vélo</option>
              <option value="voiture">Voiture</option>
            </select>

            <input
              name="vehicule_plaque"
              type="text"
              placeholder="Numéro de plaque d'immatriculation"
              className="w-full rounded border px-3 py-2"
              required
            />

            <FileField label="Photo du véhicule" name="vehicule_photo" />
            <FileField
              label="Pièce d'identité (recto)"
              name="piece_identite_recto"
            />
            <FileField
              label="Pièce d'identité (verso)"
              name="piece_identite_verso"
            />
            <FileField label="Selfie de vérification" name="selfie" />
            <FileField label="Permis de conduire" name="permis" />
            <FileField
              label="Carte grise / assurance"
              name="carte_grise"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Création..." : "S'inscrire"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}

function FileField({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      <input
        name={name}
        type="file"
        accept="image/*"
        className="w-full rounded border px-3 py-2 text-sm"
        required
      />
    </div>
  );
}
