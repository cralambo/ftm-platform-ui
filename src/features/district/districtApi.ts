import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { District, DistrictInput, ShortDistrict } from "./district.type";

const LIST = { type: "District" as const, id: "LIST" as const };

export const districtApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Liste paginée (tableau)
    getDistricts: build.query<Page<District>, PageParams>({
      query: ({ page, size }) => ({ url: "/districts", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<District>(raw),
      providesTags: providesList<District>("District"),
    }),

    // Liste complète (liste déroulante du formulaire de commune)
    getAllDistricts: build.query<District[], void>({
      query: () => "/districts/all",
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "District" as const, id })),
        LIST,
      ],
    }),

    getDistrictsByRegion: build.query<ShortDistrict[], string>({
      query: (regionId) => `/districts/region/${regionId}`,
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "District" as const, id})),
        LIST, 
      ],
    }),

    // Le backend renvoie une String (texte brut)
    addDistrict: build.mutation<string, DistrictInput>({
    query: ({ code, name, regionId }) => ({
        url: "/districts/create",
        method: "POST",
        body: { code, name, region_id: regionId },
        responseHandler: "text",
    }),
    invalidatesTags: [LIST],
    }),

    updateDistrict: build.mutation<string, DistrictInput & { id: string }>({
        query: ({ id, code, name, regionId }) => ({
            url: `/districts/update/${id}`,
            method: "PUT",
            body: { code, name, region_id: regionId },
            responseHandler: "text",
        }),
        invalidatesTags: (_r, _e, { id }) => [
            { type: "District", id },
            LIST,
            { type: "Municipality", id: "LIST" },
        ],
    }),

    deleteDistrict: build.mutation<void, string>({
      query: (id) => ({ url: `/districts/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, { type: "Municipality", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDistrictsQuery,
  useGetDistrictsByRegionQuery,
  useGetAllDistrictsQuery,
  useAddDistrictMutation,
  useUpdateDistrictMutation,
  useDeleteDistrictMutation,
} = districtApi;