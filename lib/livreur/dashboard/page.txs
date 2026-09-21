import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getCommandesDisponibles,
  getMesCommandesLivreur,
  type CommandeLivreurItem,
} from "@/lib/livreur/commandes";
import LivreurCommandeActions from "./LivreurCommandeActions";

function formatFCFA(montant: number | null) {
  return montant !== null ? `${montant.toLocaleString("fr-FR")} FCFA` : "—";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  en_cours: "En cours",
};

const STATUS_STYLES: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800",
  acceptee: "bg-blue-100 text-blue-800",
  en_cours: "bg-purple-100 text-purple-800",
};

function CommandeCard({ commande }: { commande: CommandeLivreurItem }) {
  return (
    <li className="px-4 py-3">
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-sm font-medium text-gray-900 min-w-0 truncate">
          {commande.adresse_recuperation} → {commande.adresse_livraison}
        </p>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
            STATUS_STYLES[commande.statut] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {STATUS_LABELS[commande.statut] ?? commande.statut}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{commande.commune}</p>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600 min-w-0 truncate">
          {commande.destinataire_nom} · {commande.destinataire_telephone}
        </span>
        <span className="shrink-0 font-medium text-gray-900 ml-2">
          {formatFCFA(commande.prix_livraison)}
          {commande.urgent && (
            <span className="ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
              Urgent
            </span>
          )}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{commande.description_colis}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {formatDate(commande.created_at)}
        </span>
        <LivreurCommandeActions
          commandeId={commande.id}
          statut={commande.statut}
        />
      </div>
    </li>
  );
}

export default async function LivreurDashboard() {
  const session = await getSession();
  if (!session || session.role !== "livreur") redirect("/auth/login");

  const [disponibles, mesCommandes] = await Promise.all([
    getCommandesDisponibles(),
    getMesCommandesLivreur(session.userId),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Livreur</h1>

      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Mes livraisons en cours ({mesCommandes.length})
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {mesCommandes.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              Aucune livraison en cours.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {mesCommandes.map((commande) => (
                <CommandeCard key={commande.id} commande={commande} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Commandes disponibles ({disponibles.length})
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {disponibles.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              Aucune commande disponible pour le moment.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {disponibles.map((commande) => (
                <CommandeCard key={commande.id} commande={commande} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
