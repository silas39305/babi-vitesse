"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCommande } from "./actions";
import {
  COMMUNES_PAR_ZONE,
  SUPPLEMENT_URGENT,
  ZONE_LABELS,
  calculerPrixLivraison,
  type ZoneLivraison,
} from "@/lib/client/tarifs";

const ZONES_ORDRE: ZoneLivraison[] = ["proche", "eloignee", "tres_eloignee"];

function formatFCFA(montant: number) {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

export default function NouvelleCommandeForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [commune, setCommune] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [memeNumero, setMemeNumero] = useState(false);
  const [clientNumero, setClientNumero] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const router = useRouter();

  const prixLivraison = useMemo(
    () => calculerPrixLivraison(commune, urgent),
    [commune, urgent]
  );

  function handleClientNumeroChange(value: string) {
    setClientNumero(value);
    if (memeNumero) setClientWhatsapp(value);
  }

  function handleMemeNumeroChange(checked: boolean) {
    setMemeNumero(checked);
    if (checked) setClientWhatsapp(clientNumero);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCommande(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.push(`/client/commandes/${result.id}`);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5 max-w-xl">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse de récupération
          </label>
          <input
            type="text"
            name="adresse_recuperation"
            required
            placeholder="Où récupérer le colis ?"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commune de récupération
          </label>
          <select
            name="commune"
            required
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
          >
            <option value="" disabled>
              Sélectionnez une commune
            </option>
            {ZONES_ORDRE.map((zone) => (
              <optgroup key={zone} label={ZONE_LABELS[zone]}>
                {COMMUNES_PAR_ZONE[zone].map((nom) => (
                  <option key={nom} value={nom}>
                    {nom}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse de livraison
        </label>
        <input
          type="text"
          name="adresse_livraison"
          required
          placeholder="Où livrer le colis ?"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du destinataire
          </label>
          <input
            type="text"
            name="destinataire_nom"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone du destinataire
          </label>
          <input
            type="text"
            name="destinataire_telephone"
            required
            placeholder="Ex : 0102030405"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre numéro de téléphone
          </label>
          <input
            type="text"
            name="client_numero"
            required
            value={clientNumero}
            onChange={(e) => handleClientNumeroChange(e.target.value)}
            placeholder="Ex : 0102030405"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre numéro WhatsApp
          </label>
          <input
            type="text"
            name="client_whatsapp"
            required
            value={clientWhatsapp}
            onChange={(e) => setClientWhatsapp(e.target.value)}
            disabled={memeNumero}
            placeholder="Ex : 0102030405"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <label className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={memeNumero}
              onChange={(e) => handleMemeNumeroChange(e.target.checked)}
              className="rounded border-gray-300"
            />
            Identique à mon numéro de téléphone
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nature du colis
        </label>
        <textarea
          name="description_colis"
          required
          rows={2}
          placeholder="Ex : Enveloppe de documents, petit carton, produits alimentaires..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes pour le livreur (optionnel)
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Instructions particulières, code du portail, étage..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      <label className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3 cursor-pointer hover:bg-gray-50">
        <input
          type="checkbox"
          name="urgent"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
          className="mt-0.5 rounded border-gray-300"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900">
            Livraison urgente
          </span>
          <span className="block text-xs text-gray-500">
            Ajoute {formatFCFA(SUPPLEMENT_URGENT)} au prix de la livraison.
          </span>
        </span>
      </label>

      <div className="rounded-md bg-blue-50 border border-blue-100 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-blue-900 font-medium">
          Prix de la livraison
        </span>
        <span className="text-lg font-bold text-blue-900">
          {prixLivraison !== null
            ? formatFCFA(prixLivraison)
            : "Choisissez une commune"}
        </span>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Envoi en cours..." : "Commander la livraison"}
      </button>
    </form>
  );
}
