import type { SupabaseClient } from "@supabase/supabase-js";
import { formaterPrix } from "./produits";

export type SectionService = "maintenance" | "logiciels";
export type AppareilService = "telephone" | "ordinateur" | "tous";
export type ModePrix = "fixe" | "a-partir-de" | "sur-devis";

export interface Service {
  id: string;
  section: SectionService;
  appareil: AppareilService;
  /** Regroupement affiché sur la page (ex. Software, Hardware) */
  type: string;
  nom: string;
  description: string;
  prix: number | null;
  prixMode: ModePrix;
  duree: string;
  ordre: number;
  visible: boolean;
}

export const APPAREILS: Record<AppareilService, string> = {
  telephone: "Téléphone",
  ordinateur: "Ordinateur",
  tous: "Téléphone et ordinateur",
};

export const MODES_PRIX: Record<ModePrix, string> = {
  fixe: "Prix fixe",
  "a-partir-de": "À partir de",
  "sur-devis": "Sur devis",
};

interface LigneService {
  id: string;
  section: SectionService;
  appareil: AppareilService;
  type: string;
  nom: string;
  description: string;
  prix: number | null;
  prix_mode: ModePrix;
  duree: string;
  ordre: number;
  visible: boolean;
}

export function versService(ligne: unknown): Service {
  const l = ligne as LigneService;
  return {
    id: l.id,
    section: l.section,
    appareil: l.appareil,
    type: l.type,
    nom: l.nom,
    description: l.description,
    prix: l.prix,
    prixMode: l.prix_mode,
    duree: l.duree,
    ordre: l.ordre,
    visible: l.visible,
  };
}

export function libellePrix(s: Service): string {
  if (s.prixMode === "sur-devis" || s.prix === null) return "Sur devis";
  return s.prixMode === "a-partir-de" ? `À partir de ${formaterPrix(s.prix)}` : formaterPrix(s.prix);
}

/** Services visibles d'une section (client public : jamais les services masqués). */
export async function chargerServices(db: SupabaseClient, section: SectionService): Promise<Service[]> {
  const { data, error } = await db
    .from("services")
    .select("*")
    .eq("section", section)
    .eq("visible", true)
    .order("ordre")
    .order("nom");
  if (error) {
    console.error("Services illisibles :", error.message);
    return [];
  }
  return (data ?? []).map(versService);
}

export function messageService(s: Service, nomBoutique: string, urlPage: string): string {
  return [
    `Bonjour ${nomBoutique}, je souhaite ce service :`,
    "",
    `Service : ${s.nom}`,
    `Appareil : ${APPAREILS[s.appareil]}`,
    `Tarif : ${libellePrix(s)}`,
    `Page : ${urlPage}`,
    "",
    "Pouvez-vous me donner plus de détails ? Merci.",
  ].join("\n");
}