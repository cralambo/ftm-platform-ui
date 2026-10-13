export interface Region {
  id: string;
  name: string;
}
export type RegionInput = Omit<Region, "id">;