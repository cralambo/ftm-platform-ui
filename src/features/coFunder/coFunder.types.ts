export interface CoFunder {
  id: string;
  name: string;
}

// Valeurs du formulaire
export type CoFunderInput = Omit<CoFunder, "id">;