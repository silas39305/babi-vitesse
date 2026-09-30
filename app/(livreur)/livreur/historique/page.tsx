import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getHistoriqueLivreur } from "@/lib/livreur/commandes";

function formatFCFA(montant: number | null) {
  return montant !== null ? `${montant.toLocaleString("fr-FR")} FCFA` : "—";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  livree: "Livrée",
  annulee: "Annulée",
};

const STATUS_STYLES: Record<string, string> = {
  livree: "bg-green-100 text-green-800",
  annulee: "bg-red-100 text-red-800",
};

export default async function HistoriqueLivreurPage() {
  const session = await getSession();
  if (!session || session.role !== "livreur") redirect("/auth/login");

  const historique = await getHistoriqueLivreur(session.userId);

  const totalLivrees = historique.filter((c) => c.statut === "livree").length;
  const totalGagne = historique
    .filter((c) => c.statut === "livree")
    .reduce((sum, c) => sum + (c.prix_livraison ?? 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historique</h1>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
          <p className="text-xs text-gray-500">Livraisons effectuées</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {totalLivrees}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
          <p className="text-xs text-gray-500">Total généré</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {formatFCFA(totalGagne)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {historique.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            Aucune livraison dans l&apos;historique pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {historique.map((commande) => (
              <li key={commande.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <Link
                    href={`/livreur/commandes/${commande.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 min-w-0 truncate"
                  >
                    {commande.adresse_recuperation} → {commande.adresse_livraison}
                  </Link>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                      STATUS_STYLES[commande.statut] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_LABELS[commande.statut] ?? commande.statut}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {commande.commune}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 min-w-0 truncate">
                    {commande.destinataire_nom}
                  </span>
                  <span className="shrink-0 font-medium text-gray-900 ml-2">
                    {formatFCFA(commande.prix_livraison)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(commande.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
