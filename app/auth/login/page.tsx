"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.role === "admin") router.push("/admin/dashboard");
    else if (result.role === "livreur") router.push("/livreur/dashboard");
    else router.push("/client");

    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <input
          name="telephone"
          type="tel"
          placeholder="Numéro de téléphone"
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          maxLength={6}
          pattern="\d{6}"
          placeholder="Code PIN (6 chiffres)"
          className="w-full rounded border px-3 py-2"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            S&apos;enregistrer
          </Link>
        </p>
      </form>
    </div>
  );
}
