"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { suspendClient, reactivateClient } from "./actions";

export default function ClientActions({
  clientId,
  status,
}: {
  clientId: string;
  status: "approved" | "suspended";
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSuspend() {
    setError(null);
    startTransition(async () => {
      const result = await suspendClient(clientId);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleReactivate() {
    setError(null);
    startTransition(async () => {
      const result = await reactivateClient(clientId);
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
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {status === "approved" ? (
        <button
          onClick={handleSuspend}
          disabled={isPending}
          className="px-4 py-2 bg-white text-red-600 border border-red-300 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Traitement..." : "Suspendre ce compte"}
        </button>
      ) : (
        <button
          onClick={handleReactivate}
          disabled={isPending}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Traitement..." : "Réactiver ce compte"}
        </button>
      )}
    </div>
  );
}
