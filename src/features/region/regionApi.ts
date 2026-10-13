import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { Region, RegionInput } from "./region.types";

const LIST = { type: "Region" as const, id: "LIST" as const };

export const regionApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Liste paginée (tableau)
    getRegions: build.query<Page<Region>, PageParams>({
      query: ({ page, size }) => ({ url: "/regions", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<Region>(raw),
      providesTags: providesList<Region>("Region"),
    }),

    // Liste complète (listes déroulantes)
    getAllRegions: build.query<Region[], void>({
      query: () => "/regions/all",
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "Region" as const, id })),
        LIST,
      ],
    }),

    // Le backend renvoie une String (texte brut) : on la lit en "text"
    addRegion: build.mutation<string, RegionInput>({
      query: (body) => ({
        url: "/regions/create",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateRegion: build.mutation<string, Region>({
      query: ({ id, ...body }) => ({
        url: `/regions/update/${id}`,
        method: "PUT",
        body,
        responseHandler: "text",
      }),
      // le nom de la région apparaît dans les districts
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Region", id },
        LIST,
        { type: "District", id: "LIST" },
      ],
    }),

    // 204 No Content : rien à parser
    deleteRegion: build.mutation<void, string>({
      query: (id) => ({ url: `/regions/${id}`, method: "DELETE" }),
      invalidatesTags: [
        LIST,
        { type: "District", id: "LIST" },
        { type: "Municipality", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useGetAllRegionsQuery,
  useAddRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} = regionApi;