import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { ShortStrategicPlan, StrategicPlan, StrategicPlanInput } from "./strategicPlan.types";

const LIST = { type: "StrategicPlan" as const, id: "LIST" as const };

export const strategicPlanApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStrategicPlans: build.query<Page<StrategicPlan>, PageParams>({
      query: ({ page, size }) => ({ url: "/strategic-plans", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<StrategicPlan>(raw),
      providesTags: providesList<StrategicPlan>("StrategicPlan"),
    }),

    getAllStrategicPlans: build.query<ShortStrategicPlan[], void>({
      query: () => "/strategic-plans/all",
      providesTags: (result) => [
                ...(result ?? []).map(({ id }) => ({ type: "StrategicPlan" as const, id })),
      { type: "StrategicPlan" as const, id: "LIST" as const },
          ],
    }),

    // Le backend renvoie une String (texte brut)
    addStrategicPlan: build.mutation<string, StrategicPlanInput>({
      query: (body) => ({
        url: "/strategic-plans/create",
        method: "POST",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateStrategicPlan: build.mutation<string, StrategicPlan>({
      query: ({ id, ...body }) => ({
        url: `/strategic-plans/update/${id}`,
        method: "PUT",
        body,
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "StrategicPlan", id }, LIST],
    }),

    deleteStrategicPlan: build.mutation<void, string>({
      query: (id) => ({ url: `/strategic-plans/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetStrategicPlansQuery,
  useGetAllStrategicPlansQuery,
  useAddStrategicPlanMutation,
  useUpdateStrategicPlanMutation,
  useDeleteStrategicPlanMutation,
} = strategicPlanApi;