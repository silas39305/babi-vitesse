import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMonProfilLivreur } from "@/lib/livreur/profil";
import ProfilLivreurForm from "./ProfilLivreurForm";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de validation",
  approved: "Validé",
  rejected: "Rejeté",
  suspended: "Suspendu",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-gray-200 text-gray-800",
};

const DOCUMENTS: { key: keyof NonNullable<
  Awaited<ReturnType<typeof getMonProfilLivreur>>
>; label: string }[] = [
  { key: "piece_identite_recto_url", label: "Pièce d'identité (recto)" },
  { key: "piece_identite_verso_url", label: "Pièce d'identité (verso)" },
  { key: "selfie_url", label: "Selfie" },
  { key: "permis_url", label: "Permis de conduire" },
  { key: "carte_grise_url", label: "Carte grise" },
  { key: "vehicule_photo_url", label: "Photo du véhicule" },
];

export default async function ProfilLivreurPage() {
  const session = await getSession();
  if (!session || session.role !== "livreur") redirect("/auth/login");

  const profil = await getMonProfilLivreur(session.userId);

  if (!profil) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-red-600">
          Impossible de charger votre profil.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {profil.prenom ?? ""} {profil.nom}
          </h1>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              STATUS_STYLES[profil.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {STATUS_LABELS[profil.status] ?? profil.status}
          </span>
        </div>
        {profil.status === "rejected" && profil.rejection_reason && (
          <p className="text-sm text-red-600 mt-2">
            Motif : {profil.rejection_reason}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Coordonnées et véhicule
        </h2>
        <ProfilLivreurForm
          telephone={profil.telephone ?? ""}
          whatsapp={profil.whatsapp ?? ""}
          vehiculeType={profil.vehicule_type ?? ""}
          vehiculePlaque={profil.vehicule_plaque ?? ""}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Documents transmis
        </h2>
        <ul className="space-y-2">
          {DOCUMENTS.map(({ key, label }) => {
            const url = profil[key] as string | null;
            return (
              <li
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600">{label}</span>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Voir
                  </a>
                ) : (
                  <span className="text-gray-400">Non fourni</span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-gray-400 mt-4">
          Pour remplacer un document, contactez l&apos;administrateur.
        </p>
      </div>
    </div>
  );
}
