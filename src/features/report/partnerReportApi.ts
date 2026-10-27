// src/features/partner_reports/partnerReportApi.ts
import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type {
  PartnerReport,
  PartnerReportCreateInput,
  PartnerReportUpdateInput,
  PartnerReportWithSummary,
} from "./partnerReport.types";

const LIST = { type: "PartnerReport" as const, id: "LIST" as const };

export const partnerReportApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMyPartnerReports: build.query<Page<PartnerReport>, PageParams>({
      query: ({ page, size }) => ({
        url: "/partner-reports/my-reports",
        params: { page, size },
      }),
      transformResponse: (raw: unknown) => normalizePage<PartnerReport>(raw),
      providesTags: providesList<PartnerReport>("PartnerReport"),
    }),

    getPartnerReport: build.query<PartnerReport, string>({
      query: (id) => `/partner-reports/${id}`,
      providesTags: (_r, _e, id) => [{ type: "PartnerReport" as const, id }],
    }),

    // Rapport + synthèse financière
    getPartnerReportDetail: build.query<PartnerReportWithSummary, string>({
      query: (id) => `/partner-reports/detail/${id}`,
      providesTags: (_r, _e, id) => [{ type: "PartnerReport" as const, id }],
    }),

    // Le backend renvoie le rapport créé en JSON
    addPartnerReport: build.mutation<PartnerReport, PartnerReportCreateInput>({
      query: (body) => ({
        url: "/partner-reports/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [LIST],
    }),

    initializePartnerReport: build.mutation<
      PartnerReport,
      PartnerReportCreateInput
    >({
      query: (body) => ({
        url: "/partner-reports/initialize",
        method: "POST",
        body,
      }),
      invalidatesTags: [LIST],
    }),

    updatePartnerReport: build.mutation<
      PartnerReport,
      { id: string } & PartnerReportUpdateInput
    >({
      query: ({ id, ...body }) => ({
        url: `/partner-reports/update/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "PartnerReport" as const, id },
        LIST,
      ],
    }),

    deletePartnerReport: build.mutation<void, string>({
      query: (id) => ({ url: `/partner-reports/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetMyPartnerReportsQuery,
  useGetPartnerReportQuery,
  useGetPartnerReportDetailQuery,
  useAddPartnerReportMutation,
  useInitializePartnerReportMutation,
  useUpdatePartnerReportMutation,
  useDeletePartnerReportMutation,
} = partnerReportApi;
