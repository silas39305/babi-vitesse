import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/auth/login");
  if (session.role !== "admin") redirect("/auth/login");

  return <div className="min-h-screen">{children}</div>;
}
