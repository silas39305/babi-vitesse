import Link from "next/link";
import { getAdminStats } from "@/lib/admin/stats";

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

const ROLE_LABELS: Record<string, string> = {
  client: "Client",
  livreur: "Livreur",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "Total clients",
      value: stats.totalClients,
      accent: "text-blue-600",
    },
    {
      label: "Total livreurs",
      value: stats.totalLivreurs,
      accent: "text-purple-600",
    },
    {
      label: "Livreurs approuvés",
      value: stats.livreursApprouves,
      accent: "text-green-600",
    },
    {
      label: "En attente de validation",
      value: stats.livreursEnAttente,
      accent: "text-yellow-600",
      href: "/admin/livreurs?status=pending",
      highlight: stats.livreursEnAttente > 0,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
        <p className="text-sm text-gray-500 mt-1">
          Aperçu global de l&apos;activité de la plateforme.
        </p>
      </div>

      {stats.livreursEnAttente > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">
              {stats.livreursEnAttente} livreur
              {stats.livreursEnAttente > 1 ? "s" : ""}
            </span>{" "}
            en attente de validation de documents.
          </p>
          <Link
            href="/admin/livreurs?status=pending"
            className="text-sm font-medium text-yellow-900 underline underline-offset-2 hover:no-underline"
          >
            Examiner →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => {
          const content = (
            <div
              className={`rounded-xl border bg-white p-5 shadow-sm h-full transition-colors ${
                card.highlight
                  ? "border-yellow-300 ring-1 ring-yellow-200"
                  : "border-gray-200"
              } ${card.href ? "hover:border-gray-300 hover:shadow" : ""}`}
            >
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className={`mt-2 text-3xl font-bold ${card.accent}`}>
                {card.value}
              </p>
            </div>
          );

          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Inscriptions récentes
            </h2>
            <Link
              href="/admin/livreurs"
              className="text-sm text-blue-600 hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {stats.inscriptionsRecentes.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500 text-center">
              Aucune inscription pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.inscriptionsRecentes.map((p) => (
                <li
                  key={p.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.prenom} {p.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ROLE_LABELS[p.role] ?? p.role} ·{" "}
                      {formatDate(p.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            Répartition livreurs
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Approuvés</span>
              <span className="font-semibold text-green-600">
                {stats.livreursApprouves}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">En attente</span>
              <span className="font-semibold text-yellow-600">
                {stats.livreursEnAttente}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rejetés</span>
              <span className="font-semibold text-red-600">
                {stats.livreursRejetes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
