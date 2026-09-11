import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { getSession } from "@/lib/auth/session";
import { getMesCommandes, getNombreCommandesActives } from "@/lib/client/commandes";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  en_cours: "En cours",
  livree: "Livrée",
  annulee: "Annulée",
};

const STATUS_STYLES: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800",
  acceptee: "bg-blue-100 text-blue-800",
  en_cours: "bg-purple-100 text-purple-800",
  livree: "bg-green-100 text-green-800",
  annulee: "bg-gray-100 text-gray-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ClientHome() {
  const session = await getSession();
  if (!session || session.role !== "client") redirect("/auth/login");

  const [commandesRecentes, commandesActives] = await Promise.all([
    getMesCommandes(session.userId).then((c) => c.slice(0, 5)),
    getNombreCommandesActives(session.userId),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="text-xl font-bold text-gray-900">Espace Client</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/client/profil"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Mon profil
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            {commandesActives > 0
              ? `Vous avez ${commandesActives} commande${
                  commandesActives > 1 ? "s" : ""
                } en cours.`
              : "Besoin d'envoyer un colis ?"}
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            Commander une livraison
          </p>
        </div>
        <Link
          href="/client/commandes/nouvelle"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nouvelle commande
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Commandes récentes</h2>
          <Link
            href="/client/commandes"
            className="text-sm text-blue-600 hover:underline"
          >
            Voir tout
          </Link>
        </div>

        {commandesRecentes.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-500 text-center">
            Vous n&apos;avez pas encore passé de commande.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {commandesRecentes.map((commande) => (
              <li key={commande.id}>
                <Link
                  href={`/client/commandes/${commande.id}`}
                  className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {commande.adresse_recuperation} →{" "}
                      {commande.adresse_livraison}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(commande.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 ml-3 text-xs font-medium px-2 py-1 rounded-full ${
                      STATUS_STYLES[commande.statut] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_LABELS[commande.statut] ?? commande.statut}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
