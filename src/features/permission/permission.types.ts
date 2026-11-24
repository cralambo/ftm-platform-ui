export interface Permission {
  id: string;
  name: string;
  description: string;
}

// Valeurs du formulaire (camelCase)
export type PermissionInput = { name: string; description: string };
