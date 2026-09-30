import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCommandeLivreur } from "@/lib/livreur/commandes";
import LivreurCommandeActions from "../../dashboard/LivreurCommandeActions";

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
  annulee: "bg-red-100 text-red-800",
};

function phoneDigits(numero: string) {
  return numero.replace(/[^0-9+]/g, "");
}

export default async function CommandeLivreurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "livreur") redirect("/auth/login");

  const { id } = await params;
  const commande = await getCommandeLivreur(id, session.userId);

  if (!commande) notFound();

  const actionable = ["en_attente", "acceptee", "en_cours"].includes(
    commande.statut
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl space-y-6">
      <Link
        href="/livreur/dashboard"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Retour au dashboard
      </Link>

      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">
          Commande #{commande.id.slice(0, 8)}
        </h1>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
            STATUS_STYLES[commande.statut] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {STATUS_LABELS[commande.statut] ?? commande.statut}
          {commande.urgent && " · Urgent"}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6 space-y-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">
            Récupération
          </p>
          <p className="text-sm text-gray-900">
            {commande.adresse_recuperation}
          </p>
          <p className="text-xs text-gray-400">{commande.commune}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Livraison</p>
          <p className="text-sm text-gray-900">
            {commande.adresse_livraison}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Destinataire
          </p>
          <p className="text-sm text-gray-900">{commande.destinataire_nom}</p>
          <div className="flex gap-3 mt-2">
            <a
              href={`tel:${phoneDigits(commande.destinataire_telephone)}`}
              className="text-sm text-blue-600 hover:underline"
            >
              Appeler
            </a>
            <a
              href={`https://wa.me/${phoneDigits(
                commande.destinataire_telephone
              ).replace(/^0/, "225")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:underline"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Colis</p>
          <p className="text-sm text-gray-900">
            {commande.description_colis}
          </p>
          {commande.notes && (
            <p className="text-sm text-gray-500 mt-1">
              Note : {commande.notes}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {formatDate(commande.created_at)}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatFCFA(commande.prix_livraison)}
          </span>
        </div>
      </div>

      {actionable && (
        <LivreurCommandeActions
          commandeId={commande.id}
          statut={commande.statut}
        />
      )}
    </div>
  );
}
