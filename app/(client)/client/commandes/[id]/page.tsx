import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMaCommandeDetail } from "@/lib/client/commandes";
import { ZONE_LABELS } from "@/lib/client/tarifs";
import CommandeActions from "../CommandeActions";

function formatFCFA(montant: number) {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente d'un livreur",
  acceptee: "Acceptée",
  en_cours: "En cours de livraison",
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
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "client") redirect("/auth/login");

  const { id } = await params;
  const commande = await getMaCommandeDetail(session.userId, id);

  if (!commande) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <Link
        href="/client/commandes"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Retour à mes commandes
      </Link>

      <div className="mt-4 mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Commande du {formatDate(commande.created_at)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dernière mise à jour le {formatDate(commande.updated_at)}
          </p>
        </div>
        <span
          className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${
            STATUS_STYLES[commande.statut] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {STATUS_LABELS[commande.statut] ?? commande.statut}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Trajet</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 shrink-0">Récupération</dt>
            <dd className="text-gray-900 font-medium text-right">
              {commande.adresse_recuperation}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 shrink-0">Commune</dt>
            <dd className="text-gray-900 font-medium text-right">
              {commande.commune}
              {commande.zone_prix && (
                <span className="ml-2 text-xs text-gray-400">
                  ({ZONE_LABELS[commande.zone_prix]})
                </span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 shrink-0">Livraison</dt>
            <dd className="text-gray-900 font-medium text-right">
              {commande.adresse_livraison}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Prix de la livraison</span>
          {commande.urgent && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800">
              Urgent
            </span>
          )}
        </div>
        <span className="text-lg font-bold text-gray-900">
          {commande.prix_livraison !== null
            ? formatFCFA(commande.prix_livraison)
            : "—"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Vos coordonnées</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Téléphone</dt>
              <dd className="text-gray-900 font-medium">
                {commande.client_numero}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">WhatsApp</dt>
              <dd className="text-gray-900 font-medium">
                {commande.client_whatsapp}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Destinataire</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nom</dt>
              <dd className="text-gray-900 font-medium">
                {commande.destinataire_nom}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Téléphone</dt>
              <dd className="text-gray-900 font-medium">
                {commande.destinataire_telephone}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Livreur</h2>
        {commande.livreur_nom ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nom</dt>
              <dd className="text-gray-900 font-medium">
                {commande.livreur_prenom} {commande.livreur_nom}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Téléphone</dt>
              <dd className="text-gray-900 font-medium">
                {commande.livreur_telephone}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-400">
            Pas encore assigné — un livreur acceptera bientôt votre commande.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Colis</h2>
        <p className="text-sm text-gray-900 mb-2">
          {commande.description_colis}
        </p>
        {commande.notes && (
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-600">Notes : </span>
            {commande.notes}
          </p>
        )}
      </div>

      {commande.statut === "annulee" && commande.motif_annulation && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">
            Motif d&apos;annulation
          </h2>
          <p className="text-sm text-gray-600">
            {commande.motif_annulation}
          </p>
        </div>
      )}

      <CommandeActions commandeId={commande.id} statut={commande.statut} />
    </div>
  );
}
