export interface Position {
  id: string;
  code: string;
  name: string;
}

// Version courte (ShortPositionResponse) : même forme, pour les listes déroulantes
export type ShortPosition = Position;

// Valeurs du formulaire
export type PositionInput = Omit<Position, "id">;