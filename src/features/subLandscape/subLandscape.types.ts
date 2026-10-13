import type { Landscape } from "../landscape/landscape.types";

export interface SubLandscape {
  id: string;
  name: string;
  landscape: Landscape
}

// Valeurs du formulaire (camelCase)
export type SubLandscapeInput = { name: string; landscapeId: string };