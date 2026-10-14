export interface Role {
  id: string;
  name: string;
  description: string;
}

// Valeurs du formulaire (camelCase)
export type RoleInput = { name: string; description: string };
