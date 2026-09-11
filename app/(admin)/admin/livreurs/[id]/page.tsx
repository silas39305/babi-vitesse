import Link from "next/link";
import { notFound } from "next/navigation";
import { getLivreurDetail } from "@/lib/admin/livreurs";
import LivreurActions from "../LivreurActions";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function LivreurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const livreur = await getLivreurDetail(id);

  if (!livreur) {
    notFound();
  }

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/admin/livreurs"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Retour à la liste
      </Link>

      <div className="mt-4 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {livreur.prenom} {livreur.nom}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Inscrit le {formatDate(livreur.created_at)}
          </p>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            STATUS_STYLES[livreur.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {STATUS_LABELS[livreur.status] ?? livreur.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Coordonnées</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Téléphone</dt>
              <dd className="text-gray-900 font-medium">
                {livreur.telephone}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Adresse</dt>
              <dd className="text-gray-900 font-medium text-right">
                {livreur.adresse}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Date de naissance</dt>
              <dd className="text-gray-900 font-medium">
                {formatDate(livreur.date_naissance)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">
            Contact d'urgence
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nom</dt>
              <dd className="text-gray-900 font-medium">
                {livreur.contact_urgence_nom}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Téléphone</dt>
              <dd className="text-gray-900 font-medium">
                {livreur.contact_urgence_telephone}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Véhicule</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Type</dt>
              <dd className="text-gray-900 font-medium capitalize">
                {livreur.vehicule_type}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Plaque</dt>
              <dd className="text-gray-900 font-medium">
                {livreur.vehicule_plaque}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Documents fournis
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {livreur.documents.map((doc) => (
            <div key={doc.label} className="space-y-2">
              <p className="text-xs font-medium text-gray-500">
                {doc.label}
              </p>
              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-gray-200 overflow-hidden hover:opacity-90 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doc.url}
                    alt={doc.label}
                    className="w-full h-32 object-cover bg-gray-100"
                  />
                </a>
              ) : (
                <div className="w-full h-32 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                  Non fourni
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Les liens vers les documents expirent après 10 minutes pour des
          raisons de confidentialité — rechargez la page si besoin.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Décision</h2>
        <LivreurActions livreurId={livreur.id} status={livreur.status} />
      </div>
    </div>
  );
}
