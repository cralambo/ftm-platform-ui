import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { CoFunder, CoFunderInput } from "./coFunder.types";

const LIST = { type: "CoFunder" as const, id: "LIST" as const };

export const coFunderApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCoFunders: build.query<Page<CoFunder>, PageParams>({
      query: ({ page, size }) => ({ url: "/co-funders", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<CoFunder>(raw),
      providesTags: providesList<CoFunder>("CoFunder"),
    }),

    // À confirmer : GET /co-funders/all (liste déroulante du formulaire de projet)
    getAllCoFunders: build.query<CoFunder[], void>({
      query: () => "/co-funders/all",
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "CoFunder" as const, id })),
        LIST,
      ],
    }),

    // Le backend renvoie une String (texte brut)
    addCoFunder: build.mutation<string, CoFunderInput>({
      query: (body) => ({
        url: "/co-funders/create",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateCoFunder: build.mutation<string, CoFunder>({
      query: ({ id, ...body }) => ({
        url: `/co-funders/update/${id}`,
        method: "PUT",
        body,
        responseHandler: "text",
      }),
      // Quand l'API des projets existera, invalidez aussi sa liste ici :
      // le nom du co-financeur apparaît dans les projets.
      invalidatesTags: (_r, _e, { id }) => [{ type: "CoFunder", id }, LIST],
    }),

    deleteCoFunder: build.mutation<void, string>({
      query: (id) => ({ url: `/co-funders/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetCoFundersQuery,
  useGetAllCoFundersQuery,
  useAddCoFunderMutation,
  useUpdateCoFunderMutation,
  useDeleteCoFunderMutation,
} = coFunderApi;