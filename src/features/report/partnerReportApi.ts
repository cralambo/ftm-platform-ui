// src/features/partner_reports/partnerReportApi.ts
import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type {
  PartnerReport,
  PartnerReportCreateInput,
  PartnerReportDetail,
  PartnerReportSubmitted,
  PartnerReportUpdateInput,
  PartnerReportWithSummary,
  SubmitPartnerReportRequest,
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

    submitPartnerReport: build.mutation<
      PartnerReport,
      { id: string } & SubmitPartnerReportRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/partner-reports/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PartnerReport" as const, id },
        LIST,
      ],
    }),

    // Rapports soumis et non encore assignés
    getSubmittedPartnerReports: build.query<
      Page<PartnerReportSubmitted>,
      PageParams
    >({
      query: ({ page, size }) => ({
        url: "/partner-reports/submitted",
        params: { page, size },
      }),
      transformResponse: (raw: unknown) =>
        normalizePage<PartnerReportSubmitted>(raw),
      providesTags: providesList<PartnerReportSubmitted>("PartnerReport"),
    }),

    assignPartnerReportToMe: build.mutation<PartnerReport, string>({
      query: (id) => ({
        url: `/partner-reports/${id}/assign`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "PartnerReport" as const, id },
        LIST,
      ],
    }),

    getAssignedReport: build.query<PartnerReportDetail, string>({
      query: (reportId) => ({
        url: `/partner-reports/detail/${reportId}/assigned`,
        method: "GET",
      }),

      providesTags: (_result, _error, reportId) => [
        { type: "PartnerReport", id: reportId },
      ],
    }),

    getAttachmentContent: build.query<Blob, string>({
      query: (attachmentId) => ({
        url: `/partner-reports/attachments/${attachmentId}/content`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Rapports soumis et assignés à l'utilisateur connecté
    getAssignedPartnerReports: build.query<
      Page<PartnerReportSubmitted>,
      PageParams
    >({
      query: ({ page, size }) => ({
        url: "/partner-reports/assigned",
        params: { page, size },
      }),
      transformResponse: (raw: unknown) =>
        normalizePage<PartnerReportSubmitted>(raw),
      providesTags: providesList<PartnerReportSubmitted>("PartnerReport"),
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
  useGetSubmittedPartnerReportsQuery,
  useGetAssignedPartnerReportsQuery,
  useGetAssignedReportQuery,
  useGetAttachmentContentQuery,
  useAssignPartnerReportToMeMutation,
  useUpdatePartnerReportMutation,
  useDeletePartnerReportMutation,
  useSubmitPartnerReportMutation,
} = partnerReportApi;
