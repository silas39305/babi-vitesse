import Link from "next/link";
import NouvelleCommandeForm from "../NouvelleCommandeForm";

export default function NouvelleCommandePage() {
  return (
    <div className="p-6 sm:p-8">
      <Link
        href="/client/commandes"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Retour à mes commandes
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Nouvelle commande de livraison
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Remplissez les informations ci-dessous, un livreur disponible sera
          assigné à votre commande.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <NouvelleCommandeForm />
      </div>
    </div>
  );
}
