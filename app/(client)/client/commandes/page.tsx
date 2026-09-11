import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMesCommandes, type CommandeStatut } from "@/lib/client/commandes";

function formatFCFA(montant: number) {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

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

const FILTERS: { label: string; value: CommandeStatut | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "En attente", value: "en_attente" },
  { label: "Acceptées", value: "acceptee" },
  { label: "En cours", value: "en_cours" },
  { label: "Livrées", value: "livree" },
  { label: "Annulées", value: "annulee" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MesCommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "client") redirect("/auth/login");

  const { status } = await searchParams;
  const validStatuses: CommandeStatut[] = [
    "en_attente",
    "acceptee",
    "en_cours",
    "livree",
    "annulee",
  ];
  const activeStatus = validStatuses.includes(status as CommandeStatut)
    ? (status as CommandeStatut)
    : "all";

  const commandes = await getMesCommandes(
    session.userId,
    activeStatus === "all" ? undefined : activeStatus
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historique et suivi de vos livraisons.
          </p>
        </div>
        <Link
          href="/client/commandes/nouvelle"
          className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nouvelle commande
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === activeStatus;
          const href =
            filter.value === "all"
              ? "/client/commandes"
              : `/client/commandes?status=${filter.value}`;

          return (
            <Link
              key={filter.value}
              href={href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {commandes.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-500 mb-3">
              Aucune commande pour ce filtre.
            </p>
            {activeStatus === "all" && (
              <Link
                href="/client/commandes/nouvelle"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Passer votre première commande →
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Livraison</th>
                <th className="px-5 py-3 font-medium">Destinataire</th>
                <th className="px-5 py-3 font-medium">Livreur</th>
                <th className="px-5 py-3 font-medium">Prix</th>
                <th className="px-5 py-3 font-medium">Créée le</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commandes.map((commande) => (
                <tr key={commande.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900 max-w-xs truncate">
                    {commande.adresse_recuperation} →{" "}
                    {commande.adresse_livraison}
                    <span className="block text-xs text-gray-400">
                      {commande.commune}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {commande.destinataire_nom}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {commande.livreur_nom
                      ? `${commande.livreur_prenom} ${commande.livreur_nom}`
                      : "Non assigné"}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {commande.prix_livraison !== null
                      ? formatFCFA(commande.prix_livraison)
                      : "—"}
                    {commande.urgent && (
                      <span className="ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        Urgent
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {formatDate(commande.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_STYLES[commande.statut] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABELS[commande.statut] ?? commande.statut}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/client/commandes/${commande.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
