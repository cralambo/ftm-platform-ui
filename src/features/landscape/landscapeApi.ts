import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { Landscape, LandscapeInput } from "./landscape.types";

const LIST = { type: "Landscape" as const, id: "LIST" as const };

export const landscapeApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Liste paginée (tableau)
    getLandscapes: build.query<Page<Landscape>, PageParams>({
      query: ({ page, size }) => ({ url: "/landscapes", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<Landscape>(raw),
      providesTags: providesList<Landscape>("Landscape"),
    }),

    // Liste complète (listes déroulantes)
    getAllLandscapes: build.query<Landscape[], void>({
      query: () => "/landscapes/all",
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "Landscape" as const, id })),
        LIST,
      ],
    }),

    // Le backend renvoie une String (texte brut) : on la lit en "text"
    addLandscape: build.mutation<string, LandscapeInput>({
      query: (body) => ({
        url: "/landscapes/create",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateLandscape: build.mutation<string, Landscape>({
      query: ({ id, ...body }) => ({
        url: `/landscapes/update/${id}`,
        method: "PUT",
        body,
        responseHandler: "text",
      }),
      // le nom de la région apparaît dans les districts
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Landscape", id },
        LIST,
        { type: "SubLandscape", id: "LIST" },
      ],
    }),

    // 204 No Content : rien à parser
    deleteLandscape: build.mutation<void, string>({
      query: (id) => ({ url: `/landscapes/${id}`, method: "DELETE" }),
      invalidatesTags: [
        LIST,
        { type: "Region", id: "LIST"},
        { type: "District", id: "LIST" },
        { type: "Municipality", id: "LIST" },
        { type: "SubLandscape", id: "LIST"}
      ],
    }),
  }),
});

export const {
  useGetLandscapesQuery,
  useGetAllLandscapesQuery,
  useAddLandscapeMutation,
  useUpdateLandscapeMutation,
  useDeleteLandscapeMutation,
} = landscapeApi;