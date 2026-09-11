"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelCommande } from "./actions";
import type { CommandeStatut } from "@/lib/client/commandes";

export default function CommandeActions({
  commandeId,
  statut,
}: {
  commandeId: string;
  statut: CommandeStatut;
}) {
  const [isPending, startTransition] = useTransition();
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const canCancel = statut === "en_attente" || statut === "acceptee";

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelCommande(commandeId, motif);
      if ("error" in result) {
        setError(result.error);
      } else {
        setShowCancelForm(false);
        router.refresh();
      }
    });
  }

  if (!canCancel) {
    return null;
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {!showCancelForm ? (
        <button
          onClick={() => setShowCancelForm(true)}
          disabled={isPending}
          className="px-4 py-2 bg-white text-red-600 border border-red-300 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          Annuler la commande
        </button>
      ) : (
        <div className="space-y-3">
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Motif de l'annulation (optionnel)"
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Annulation..." : "Confirmer l'annulation"}
            </button>
            <button
              onClick={() => setShowCancelForm(false)}
              disabled={isPending}
              className="px-4 py-2 bg-white text-gray-600 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
