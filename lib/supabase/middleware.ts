import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

type SessionPayload = {
  userId: string;
  role: "client" | "livreur" | "admin";
};

async function getSessionFromCookie(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get("session")?.value;
  if (!token || !encodedKey) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Préfixe de route -> rôle requis
const PROTECTED_PREFIXES: { prefix: string; role: SessionPayload["role"] }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/livreur", role: "livreur" },
  { prefix: "/client", role: "client" },
];

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes toujours publiques
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const matchedRoute = PROTECTED_PREFIXES.find((r) =>
    pathname.startsWith(r.prefix)
  );

  // Route non listée comme protégée : on laisse passer
  if (!matchedRoute) {
    return NextResponse.next();
  }

  const session = await getSessionFromCookie(request);

  // Pas connecté -> redirection login
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Connecté mais mauvais rôle -> redirection vers son propre espace
  if (session.role !== matchedRoute.role) {
    const url = request.nextUrl.clone();
    url.pathname =
      session.role === "admin"
        ? "/admin/dashboard"
        : session.role === "livreur"
        ? "/livreur/dashboard"
        : "/client";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
