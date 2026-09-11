"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLivreurInfo } from "./actions";

const VEHICULE_OPTIONS = [
  { value: "moto", label: "Moto" },
  { value: "velo", label: "Vélo" },
  { value: "voiture", label: "Voiture" },
];

export default function LivreurEditForm({
  livreurId,
  telephone,
  vehiculeType,
  vehiculePlaque,
}: {
  livreurId: string;
  telephone: string;
  vehiculeType: string;
  vehiculePlaque: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateLivreurInfo(livreurId, formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-blue-600 hover:underline font-medium"
      >
        Modifier
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="mt-3 space-y-3 border-t border-gray-100 pt-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Téléphone
        </label>
        <input
          type="text"
          name="telephone"
          defaultValue={telephone}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Type de véhicule
        </label>
        <select
          name="vehicule_type"
          defaultValue={vehiculeType}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        >
          {VEHICULE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Plaque d'immatriculation
        </label>
        <input
          type="text"
          name="vehicule_plaque"
          defaultValue={vehiculePlaque}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsEditing(false);
          }}
          disabled={isPending}
          className="px-4 py-2 bg-white text-gray-600 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
