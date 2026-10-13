// Noms identiques à ceux du backend (snake_case)
export interface BoardMember {
  id: string;
  firstname: string;
  lastname: string;
  personal_email: string | null;
  professional_email: string;
  phone: string | null;
  address: string | null;
  position: string;
  appointment_date: string; // "YYYY-MM-DD"
  end_date: string | null;
}

// Valeurs du formulaire : des chaînes (vides si non renseigné)
export interface BoardMemberInput {
  firstname: string;
  lastname: string;
  personal_email: string;
  professional_email: string;
  phone: string;
  address: string;
  position: string;
  appointment_date: string;
  end_date: string;
}