import type { ShortDistrict } from "../district/district.type";

export interface Municipality {
  id: string;
  name: string;
  district: ShortDistrict
}

// Valeurs du formulaire (camelCase)
export type MunicipalityInput = { name: string; districtId: string };