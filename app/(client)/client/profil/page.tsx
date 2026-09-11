import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMonProfil } from "@/lib/client/profil";
import ProfilForm from "./ProfilForm";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session || session.role !== "client") redirect("/auth/login");

  const profil = await getMonProfil(session.userId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
      <Link
        href="/client"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Retour à l&apos;accueil
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ces informations pré-remplissent automatiquement vos prochaines
          commandes.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6">
        <ProfilForm
          nom={profil?.nom ?? ""}
          prenom={profil?.prenom ?? ""}
          telephone={profil?.telephone ?? ""}
          whatsapp={profil?.whatsapp ?? ""}
        />
      </div>
    </div>
  );
}
