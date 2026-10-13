import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { Municipality, MunicipalityInput } from "./municipality.types";

const LIST = { type: "Municipality" as const, id: "LIST" as const };

export const municipalityApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Liste paginée (tableau)
    getMunicipalities: build.query<Page<Municipality>, PageParams>({
      query: ({ page, size }) => ({ url: "/municipalities", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<Municipality>(raw),
      providesTags: providesList<Municipality>("Municipality"),
    }),


    // Le backend renvoie une String (texte brut)
    addMunicipality: build.mutation<string, MunicipalityInput>({
    query: ({ name, districtId }) => ({
        url: "/municipalities/create",
        method: "POST",
        body: { name, district_id: districtId },
        responseHandler: "text",
    }),
    invalidatesTags: [LIST],
    }),

    updateMunicipality: build.mutation<string, MunicipalityInput & { id: string }>({
        query: ({ id, name, districtId }) => ({
            url: `/municipalities/update/${id}`,
            method: "PUT",
            body: { name, district_id: districtId },
            responseHandler: "text",
        }),
        invalidatesTags: (_r, _e, { id }) => [
            { type: "District", id },
            LIST,
            { type: "Municipality", id: "LIST" },
        ],
    }),

    deleteMunicipality: build.mutation<void, string>({
      query: (id) => ({ url: `/municipalities/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, { type: "Municipality", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMunicipalitiesQuery,
  useAddMunicipalityMutation,
  useUpdateMunicipalityMutation,
  useDeleteMunicipalityMutation,
} = municipalityApi;