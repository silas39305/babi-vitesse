import Link from "next/link";
import { getLivreurs, type LivreurStatus } from "@/lib/admin/livreurs";

const STATUS_LABELS: Record<string, string> = {
  approved: "Approuvé",
  pending: "En attente",
  rejected: "Rejeté",
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

const FILTERS: { label: string; value: LivreurStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "En attente", value: "pending" },
  { label: "Approuvés", value: "approved" },
  { label: "Rejetés", value: "rejected" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function LivreursPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus =
    status === "pending" || status === "approved" || status === "rejected"
      ? status
      : "all";

  const livreurs = await getLivreurs(
    activeStatus === "all" ? undefined : activeStatus
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Livreurs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérer les comptes livreurs et valider leurs documents.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === activeStatus;
          const href =
            filter.value === "all"
              ? "/admin/livreurs"
              : `/admin/livreurs?status=${filter.value}`;

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
        {livreurs.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-500 text-center">
            Aucun livreur trouvé pour ce filtre.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Nom</th>
                <th className="px-5 py-3 font-medium">Téléphone</th>
                <th className="px-5 py-3 font-medium">Véhicule</th>
                <th className="px-5 py-3 font-medium">Inscrit le</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {livreurs.map((livreur) => (
                <tr key={livreur.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {livreur.prenom} {livreur.nom}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {livreur.telephone}
                  </td>
                  <td className="px-5 py-3 text-gray-600 capitalize">
                    {livreur.vehicule_type}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {formatDate(livreur.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_STYLES[livreur.status] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABELS[livreur.status] ?? livreur.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/livreurs/${livreur.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Voir le dossier →
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
