import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientDetail } from "@/lib/admin/clients";
import ClientActions from "../ClientActions";

const STATUS_LABELS: Record<string, string> = {
  approved: "Actif",
  suspended: "Suspendu",
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientDetail(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/admin/clients"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Retour à la liste
      </Link>

      <div className="mt-4 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {client.prenom} {client.nom}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Inscrit le {formatDate(client.created_at)}
          </p>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            STATUS_STYLES[client.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {STATUS_LABELS[client.status] ?? client.status}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Coordonnées</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Téléphone</dt>
            <dd className="text-gray-900 font-medium">{client.telephone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">WhatsApp</dt>
            <dd className="text-gray-900 font-medium">{client.whatsapp}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Adresse</dt>
            <dd className="text-gray-900 font-medium text-right">
              {client.adresse}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Compte</h2>
        <ClientActions clientId={client.id} status={client.status} />
      </div>
    </div>
  );
}
