"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  accepterCommande,
  demarrerLivraison,
  marquerLivree,
} from "./actions";
import type { CommandeStatut } from "@/lib/livreur/commandes";

export default function LivreurCommandeActions({
  commandeId,
  statut,
}: {
  commandeId: string;
  statut: CommandeStatut;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function runAction(action: (id: string) => Promise<{ error: string } | { success: true }>) {
    setError(null);
    startTransition(async () => {
      const result = await action(commandeId);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      {error && (
        <p className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {statut === "en_attente" && (
        <button
          onClick={() => runAction(accepterCommande)}
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "..." : "Accepter"}
        </button>
      )}

      {statut === "acceptee" && (
        <button
          onClick={() => runAction(demarrerLivraison)}
          disabled={isPending}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "..." : "Démarrer la livraison"}
        </button>
      )}

      {statut === "en_cours" && (
        <button
          onClick={() => runAction(marquerLivree)}
          disabled={isPending}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "..." : "Marquer livrée"}
        </button>
      )}
    </div>
  );
        }
          
