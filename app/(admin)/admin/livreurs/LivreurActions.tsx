"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveLivreur,
  rejectLivreur,
  suspendLivreur,
  reactivateLivreur,
  reopenLivreur,
} from "./actions";
import type { LivreurStatus } from "@/lib/admin/livreurs";

export default function LivreurActions({
  livreurId,
  status,
  rejectionReason,
}: {
  livreurId: string;
  status: LivreurStatus;
  rejectionReason?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(action: () => Promise<{ error: string } | { success: true }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if ("error" in result) {
        setError(result.error);
      } else {
        setShowRejectForm(false);
        router.refresh();
      }
    });
  }

  function handleApprove() {
    run(() => approveLivreur(livreurId));
  }

  function handleReject() {
    run(() => rejectLivreur(livreurId, motif));
  }

  function handleSuspend() {
    if (!confirm("Suspendre ce livreur ? Il ne pourra plus se connecter tant qu'il n'est pas réactivé.")) {
      return;
    }
    run(() => suspendLivreur(livreurId));
  }

  function handleReactivate() {
    run(() => reactivateLivreur(livreurId));
  }

  function handleReopen() {
    if (!confirm("Repasser ce dossier en attente pour réexamen ? Le motif de rejet actuel sera effacé.")) {
      return;
    }
    run(() => reopenLivreur(livreurId));
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {status === "pending" && !showRejectForm && (
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
      )}

      {status === "pending" && showRejectForm && (
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

      {status === "approved" && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            Ce livreur est actif et peut se connecter.
          </p>
          <button
            onClick={handleSuspend}
            disabled={isPending}
            className="px-4 py-2 bg-white text-orange-600 border border-orange-300 text-sm font-medium rounded-md hover:bg-orange-50 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Traitement..." : "Suspendre"}
          </button>
        </div>
      )}

      {status === "suspended" && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            Ce compte est suspendu — le livreur ne peut plus se connecter.
          </p>
          <button
            onClick={handleReactivate}
            disabled={isPending}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Traitement..." : "Réactiver"}
          </button>
        </div>
      )}

      {status === "rejected" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Ce dossier a été rejeté
            {rejectionReason ? (
              <>
                {" "}
                — motif :{" "}
                <span className="text-gray-700 font-medium">
                  {rejectionReason}
                </span>
              </>
            ) : (
              "."
            )}
          </p>
          <button
            onClick={handleReopen}
            disabled={isPending}
            className="px-4 py-2 bg-white text-blue-600 border border-blue-300 text-sm font-medium rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Traitement..." : "Repasser en attente pour réexamen"}
          </button>
        </div>
      )}
    </div>
  );
}
