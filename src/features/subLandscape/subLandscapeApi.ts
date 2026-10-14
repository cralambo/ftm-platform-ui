import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { SubLandscape, SubLandscapeInput } from "./subLandscape.types";

const LIST = { type: "SubLandscape" as const, id: "LIST" as const };

export const subLandscapeApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Liste paginée (tableau)
    getSubLandscapes: build.query<Page<SubLandscape>, PageParams>({
      query: ({ page, size }) => ({ url: "/sub-landscapes", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<SubLandscape>(raw),
      providesTags: providesList<SubLandscape>("SubLandscape"),
    }),


    // Le backend renvoie une String (texte brut)
    addSubLandscape: build.mutation<string, SubLandscapeInput>({
    query: ({ name, landscapeId }) => ({
        url: "/sub-landscapes/create",
        method: "POST",
        body: { name, landscape_id: landscapeId },
        responseHandler: "text",
    }),
    invalidatesTags: [LIST],
    }),

    updateSubLandscape: build.mutation<string, SubLandscapeInput & { id: string }>({
        query: ({ id, name, landscapeId }) => ({
            url: `/sub-landscapes/update/${id}`,
            method: "PUT",
            body: { name, landscape_id: landscapeId },
            responseHandler: "text",
        }),
        invalidatesTags: (_r, _e, { id }) => [
            { type: "District", id },
            LIST,
            { type: "Municipality", id: "LIST" },
        ],
    }),

    deleteSubLandscape: build.mutation<void, string>({
      query: (id) => ({ url: `/sub-landscapes/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, { type: "SubLandscape", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSubLandscapesQuery,
  useAddSubLandscapeMutation,
  useUpdateSubLandscapeMutation,
  useDeleteSubLandscapeMutation,
} = subLandscapeApi;