import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function LivreurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/auth/login");
  if (session.role !== "livreur") redirect("/auth/login");

  return <div className="min-h-screen">{children}</div>;
}
