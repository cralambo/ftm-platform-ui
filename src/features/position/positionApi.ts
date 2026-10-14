import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { Position, PositionInput, ShortPosition } from "./position.types";

const LIST = { type: "Position" as const, id: "LIST" as const };

export const positionApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPositions: build.query<Page<Position>, PageParams>({
      query: ({ page, size }) => ({ url: "/positions", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<Position>(raw),
      providesTags: providesList<Position>("Position"),
    }),

    // À confirmer : GET /positions/all renvoyant des ShortPositionResponse.
    // Utile pour la liste déroulante du formulaire d'employé.
    getAllPositions: build.query<ShortPosition[], void>({
      query: () => "/positions/all",
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "Position" as const, id })),
        LIST,
      ],
    }),

    // Le backend renvoie une String (texte brut)
    addPosition: build.mutation<string, PositionInput>({
      query: (body) => ({
        url: "/positions/create",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updatePosition: build.mutation<string, Position>({
      query: ({ id, ...body }) => ({
        url: `/positions/update/${id}`,
        method: "PUT",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [
            { type: "Position", id },
            LIST,
            { type: "Employee", id: "LIST" },
        ],
    }),

    deletePosition: build.mutation<void, string>({
      query: (id) => ({ url: `/positions/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, { type: "Employee", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPositionsQuery,
  useGetAllPositionsQuery,
  useAddPositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} = positionApi;