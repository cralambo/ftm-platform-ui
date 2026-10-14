import type { ShortSupportPartner } from "@/features/partner/supportPartner.types";

export interface PartnerContact {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  address: string | null;
  supportPartner: ShortSupportPartner | null; // camelCase dans la réponse
}

// Valeurs du formulaire (noms de la requête, snake_case)
export interface PartnerContactInput {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  support_partner_id: string;
}