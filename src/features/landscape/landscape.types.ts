export interface Landscape {
  id: string;
  name: string;
}
export type LandscapeInput = Omit<Landscape, "id">;