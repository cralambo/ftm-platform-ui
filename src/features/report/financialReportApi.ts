import { api } from "@/services/api";

export interface FinancialReportItem {
  id: string;
  designation: string;
  quantity: string;
  unit_amount: string;
  total_amount: string;
  observations: string | null;
}

export interface FinancialReportItemRequest {
  designation: string;
  quantity: string;
  unit_amount: string;
  observations: string | null;
}

export interface FinancialSummary {
  report_id: string;
  disbursement_schedule_id: string;
  schedule_reference: string;
  budget_status: "WITH_REMAINDER" | "FULLY_CONSUMED" | "OVER_BUDGET";
  budget_amount: string;
  total_expenses: string;
  remaining_amount: string;
  overrun_amount: string;
  consumption_rate: string;
}

export const financialReportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialReportItems: builder.query<FinancialReportItem[], string>({
      query: (reportId) => `/partner-reports/${reportId}/financial-items`,
      providesTags: (result, _error, reportId) => [
        { type: "FinancialReportItem", id: `REPORT-${reportId}` },
        ...(result ?? []).map((item) => ({
          type: "FinancialReportItem" as const,
          id: item.id,
        })),
      ],
    }),

    createFinancialReportItem: builder.mutation<
      FinancialReportItem,
      { reportId: string; body: FinancialReportItemRequest }
    >({
      query: ({ reportId, body }) => ({
        url: `/partner-reports/${reportId}/financial-reports`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { reportId }) => [
        { type: "FinancialReportItem", id: `REPORT-${reportId}` },
        { type: "FinancialSummary", id: reportId },
      ],
    }),

    updateFinancialReportItem: builder.mutation<
      FinancialReportItem,
      {
        reportId: string;
        itemId: string;
        body: FinancialReportItemRequest;
      }
    >({
      query: ({ reportId, itemId, body }) => ({
        url: `/partner-reports/${reportId}/financial-items/${itemId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { reportId, itemId }) => [
        { type: "FinancialReportItem", id: `REPORT-${reportId}` },
        { type: "FinancialReportItem", id: itemId },
        { type: "FinancialSummary", id: reportId },
      ],
    }),

    deleteFinancialReportItem: builder.mutation<
      void,
      { reportId: string; itemId: string }
    >({
      query: ({ reportId, itemId }) => ({
        url: `/partner-reports/${reportId}/financial-items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { reportId, itemId }) => [
        { type: "FinancialReportItem", id: `REPORT-${reportId}` },
        { type: "FinancialReportItem", id: itemId },
        { type: "FinancialSummary", id: reportId },
      ],
    }),

    getFinancialSummary: builder.query<FinancialSummary, string>({
      query: (reportId) => `/partner-reports/${reportId}/financial-summary`,
      providesTags: (_result, _error, reportId) => [
        { type: "FinancialSummary", id: reportId },
      ],
    }),
  }),
});

export const {
  useGetFinancialReportItemsQuery,
  useCreateFinancialReportItemMutation,
  useUpdateFinancialReportItemMutation,
  useDeleteFinancialReportItemMutation,
  useGetFinancialSummaryQuery,
} = financialReportApi;
