import type { Permission } from "../permission/permission.types";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions?: Permission[];
}

// Valeurs du formulaire (camelCase)
export type RoleInput = { name: string; description: string };
