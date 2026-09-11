"use client";

import { useState, useTransition } from "react";
import { updateProfilClient } from "./actions";

export default function ProfilForm({
  nom: nomInitial,
  prenom: prenomInitial,
  telephone: telephoneInitial,
  whatsapp: whatsappInitial,
}: {
  nom: string;
  prenom: string;
  telephone: string;
  whatsapp: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [telephone, setTelephone] = useState(telephoneInitial);
  const [whatsapp, setWhatsapp] = useState(whatsappInitial);
  const [memeNumero, setMemeNumero] = useState(
    telephoneInitial !== "" && telephoneInitial === whatsappInitial
  );

  function handleTelephoneChange(value: string) {
    setTelephone(value);
    if (memeNumero) setWhatsapp(value);
  }

  function handleMemeNumeroChange(checked: boolean) {
    setMemeNumero(checked);
    if (checked) setWhatsapp(telephone);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProfilClient(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          Profil mis à jour avec succès.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            type="text"
            name="prenom"
            required
            defaultValue={prenomInitial}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            name="nom"
            required
            defaultValue={nomInitial}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de téléphone
          </label>
          <input
            type="text"
            name="telephone"
            required
            value={telephone}
            onChange={(e) => handleTelephoneChange(e.target.value)}
            placeholder="Ex : 0102030405"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro WhatsApp
          </label>
          <input
            type="text"
            name="whatsapp"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
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

      <p className="text-xs text-gray-500">
        Ces coordonnées seront proposées automatiquement à chaque nouvelle
        commande — vous pourrez toujours les modifier ponctuellement.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
