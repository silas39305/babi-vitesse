import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LogoutButton from "@/components/LogoutButton";

export default async function LivreurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/auth/login");
  if (session.role !== "livreur") redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <nav className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
            <Link
              href="/livreur/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 px-2 py-1.5 whitespace-nowrap"
            >
              Dashboard
            </Link>
            <Link
              href="/livreur/historique"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 px-2 py-1.5 whitespace-nowrap"
            >
              Historique
            </Link>
            <Link
              href="/livreur/profil"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 px-2 py-1.5 whitespace-nowrap"
            >
              Profil
            </Link>
          </div>
          <LogoutButton />
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
