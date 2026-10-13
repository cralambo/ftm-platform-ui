// Noms identiques à ceux du backend (snake_case)
export interface LocalOrganization {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
}

export interface ShortLocalOrganization {
    id: string;
    name: string;
}

// Valeurs du formulaire : des chaînes (vides si non renseigné)
export interface LocalOrganizationInput {
    name: string;
    address: string;
    phone: string;
    email: string;
}