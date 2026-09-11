"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveLivreur, rejectLivreur } from "./actions";

export default function LivreurActions({
  livreurId,
  status,
}: {
  livreurId: string;
  status: "approved" | "pending" | "rejected";
}) {
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveLivreur(livreurId);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectLivreur(livreurId, motif);
      if ("error" in result) {
        setError(result.error);
      } else {
        setShowRejectForm(false);
        router.refresh();
      }
    });
  }

  if (status !== "pending") {
    return (
      <p className="text-sm text-gray-500">
        Ce dossier a déjà été traité — statut actuel :{" "}
        <span className="font-medium">
          {status === "approved" ? "Approuvé" : "Rejeté"}
        </span>
        .
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {!showRejectForm ? (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Traitement..." : "Approuver"}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={isPending}
            className="px-4 py-2 bg-white text-red-600 border border-red-300 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            Rejeter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Motif du rejet (optionnel, mais recommandé)"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={isPending}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Traitement..." : "Confirmer le rejet"}
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              disabled={isPending}
              className="px-4 py-2 bg-white text-gray-600 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
