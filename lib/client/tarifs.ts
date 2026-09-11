// Tarification de la livraison en fonction de la commune de récupération.
//
// ⚠️ Répartition PAR DÉFAUT des communes d'Abidjan par zone de prix.
// À corriger/ajuster selon la couverture réelle des livreurs — c'est le
// seul fichier à modifier pour changer une commune de zone ou ajouter
// une commune manquante.

export type ZoneLivraison = "proche" | "eloignee" | "tres_eloignee";

export const ZONE_LABELS: Record<ZoneLivraison, string> = {
  proche: "Proche",
  eloignee: "Éloignée",
  tres_eloignee: "Très éloignée",
};

// Prix de base de la livraison selon la zone (en FCFA).
export const TARIFS_ZONE: Record<ZoneLivraison, number> = {
  proche: 1500,
  eloignee: 2000,
  tres_eloignee: 2500,
};

// Supplément ajouté si l'option "urgent" est cochée.
export const SUPPLEMENT_URGENT = 2000;

// Répartition par défaut des communes d'Abidjan (et environs) par zone.
export const COMMUNES_PAR_ZONE: Record<ZoneLivraison, string[]> = {
  proche: ["Plateau", "Cocody", "Adjamé", "Marcory", "Treichville", "Koumassi"],
  eloignee: ["Yopougon", "Abobo", "Attécoubé", "Port-Bouët"],
  tres_eloignee: ["Anyama", "Bingerville", "Songon", "Grand-Bassam"],
};

// Liste plate ordonnée (zone par zone) utilisée pour peupler le <select>
// et pour retrouver la zone d'une commune donnée.
export const COMMUNES: { nom: string; zone: ZoneLivraison }[] = (
  Object.entries(COMMUNES_PAR_ZONE) as [ZoneLivraison, string[]][]
).flatMap(([zone, communes]) => communes.map((nom) => ({ nom, zone })));

export function getZoneForCommune(commune: string): ZoneLivraison | null {
  const cible = commune.trim().toLowerCase();
  const found = COMMUNES.find((c) => c.nom.toLowerCase() === cible);
  return found ? found.zone : null;
}

// Calcule le prix total de la livraison (base zone + supplément urgent).
// Retourne null si la commune n'est pas reconnue.
export function calculerPrixLivraison(
  commune: string,
  urgent: boolean
): number | null {
  const zone = getZoneForCommune(commune);
  if (!zone) return null;
  return TARIFS_ZONE[zone] + (urgent ? SUPPLEMENT_URGENT : 0);
}
