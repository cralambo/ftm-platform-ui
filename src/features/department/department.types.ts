export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

// Version courte (ShortDepartmentResponse) : listes déroulantes et objets imbriqués
export interface ShortDepartment {
  id: string;
  code: string;
  name: string;
}

// Valeurs du formulaire
export interface DepartmentInput {
  code: string;
  name: string;
  description: string;
}