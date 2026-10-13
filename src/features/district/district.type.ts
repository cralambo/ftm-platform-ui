import type { Region } from "../region/region.types";

export interface District {
  id: string;
  code: string;
  name: string;
  region: Region
}

export interface ShortDistrict {
  id: string;
  code: string;
  name: string;
}

// Valeurs du formulaire (camelCase)
export type DistrictInput = { code: string; name: string; regionId: string };