import { api } from "@/services/api";

export interface TechnicalReportItem {
  id: string;
  disbursement_activity_id: string;
  activity_name: string;
  achieved_quantity: string | null;
  achieved_unit: string | null;
  result_description: string | null;
  observations: string | null;
}

export interface UpsertTechnicalReportItemRequest {
  achieved_quantity: string | null;
  achieved_unit: string | null;
  result_description: string | null;
  observations: string | null;
}

export const technicalReportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTechnicalReportItems: builder.query<TechnicalReportItem[], string>({
      query: (reportId) => `/partner-reports/${reportId}/technical-items`,
      providesTags: (result, _error, reportId) => [
        { type: "TechnicalReportItem", id: `REPORT-${reportId}` },
        ...(result ?? []).map((item) => ({
          type: "TechnicalReportItem" as const,
          id: item.disbursement_activity_id,
        })),
      ],
    }),

    upsertTechnicalReportItem: builder.mutation<
      TechnicalReportItem,
      {
        reportId: string;
        activityId: string;
        body: UpsertTechnicalReportItemRequest;
      }
    >({
      query: ({ reportId, activityId, body }) => ({
        url: `/partner-reports/${reportId}/technical-items/${activityId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { reportId, activityId }) => [
        { type: "TechnicalReportItem", id: `REPORT-${reportId}` },
        { type: "TechnicalReportItem", id: activityId },
      ],
    }),

    deleteTechnicalReportItem: builder.mutation<
      void,
      { reportId: string; activityId: string }
    >({
      query: ({ reportId, activityId }) => ({
        url: `/partner-reports/${reportId}/technical-items/${activityId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { reportId, activityId }) => [
        { type: "TechnicalReportItem", id: `REPORT-${reportId}` },
        { type: "TechnicalReportItem", id: activityId },
      ],
    }),
  }),
});

export const {
  useGetTechnicalReportItemsQuery,
  useUpsertTechnicalReportItemMutation,
  useDeleteTechnicalReportItemMutation,
} = technicalReportApi;
