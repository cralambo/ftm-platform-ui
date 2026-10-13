// Noms identiques à ceux du backend (snake_case)
export interface SupportPartner {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
}

// Valeurs du formulaire : des chaînes (vides si non renseigné)
export interface SupportPartnerInput {
    name: string;
    address: string;
    phone: string;
    email: string;
}

// À ajuster selon ShortSupportPartnerResponse
export interface ShortSupportPartner {
  id: string;
  name: string;
}