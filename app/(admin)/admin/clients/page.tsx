import Link from "next/link";
import { getClients, type ClientStatus } from "@/lib/admin/clients";

const STATUS_LABELS: Record<string, string> = {
  approved: "Actif",
  suspended: "Suspendu",
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
};

const FILTERS: { label: string; value: ClientStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Actifs", value: "approved" },
  { label: "Suspendus", value: "suspended" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const activeStatus =
    status === "approved" || status === "suspended" ? status : "all";

  const clients = await getClients(
    activeStatus === "all" ? undefined : activeStatus,
    q
  );

  function buildHref(filterValue: string) {
    const params = new URLSearchParams();
    if (filterValue !== "all") params.set("status", filterValue);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/clients?${qs}` : "/admin/clients";
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500 mt-1">
          Rechercher et gérer les comptes clients.
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex gap-2">
          {FILTERS.map((filter) => {
            const isActive = filter.value === activeStatus;
            return (
              <Link
                key={filter.value}
                href={buildHref(filter.value)}
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

        <form method="get" className="flex gap-2">
          {activeStatus !== "all" && (
            <input type="hidden" name="status" value={activeStatus} />
          )}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher nom, prénom, téléphone…"
            className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Rechercher
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {clients.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-500 text-center">
            Aucun client trouvé.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Nom</th>
                <th className="px-5 py-3 font-medium">Téléphone</th>
                <th className="px-5 py-3 font-medium">WhatsApp</th>
                <th className="px-5 py-3 font-medium">Inscrit le</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {client.prenom} {client.nom}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {client.telephone}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {client.whatsapp}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_STYLES[client.status] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABELS[client.status] ?? client.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/clients/${client.id}`}
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
