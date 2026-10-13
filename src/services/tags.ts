import type { Page } from "@/types/common";
import type { TagType } from "./api";

/** Tags d'une liste paginée : un par élément + un tag "LIST" pour la liste entière. */
export const providesList =
  <T extends { id: string }>(type: TagType) =>
  (result?: Page<T>) => [
    ...(result?.content ?? []).map(({ id }) => ({ type, id })),
    { type, id: "LIST" as const },
  ];