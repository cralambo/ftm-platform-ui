import { api } from "@/services/api";

export interface ReportAttachment {
  id: string;
  name: string;
  original_filename: string;
  file_size: number | string;
  content_type?: string | null;
  document_type?: string | null;
  description?: string | null;
  uploaded_at: string;
}

interface GeneralAttachmentsArgs {
  reportId: string;
}

interface TechnicalAttachmentsArgs {
  reportId: string;
  technicalItemId: string;
}

interface FinancialAttachmentsArgs {
  reportId: string;
  financialItemId: string;
}

interface UploadAttachmentArgs {
  reportId: string;
  file: File;
  name: string;
  documentType?: string;
  description?: string;
}

interface UploadTechnicalAttachmentArgs
  extends UploadAttachmentArgs, TechnicalAttachmentsArgs {}

interface UploadFinancialAttachmentArgs
  extends UploadAttachmentArgs, FinancialAttachmentsArgs {}

interface DeleteAttachmentArgs {
  reportId: string;
  attachmentId: string;
  technicalItemId?: string;
  financialItemId?: string;
}

interface DownloadAttachmentArgs {
  reportId: string;
  attachmentId: string;
}

export const reportAttachmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // Pièces justificatives générales du rapport
    // =====================================================
    getGeneralAttachments: builder.query<
      ReportAttachment[],
      GeneralAttachmentsArgs
    >({
      query: ({ reportId }) => `/partner-reports/${reportId}/attachments`,
      providesTags: (_result, _error, { reportId }) => [
        { type: "ReportAttachment", id: `general-${reportId}` },
      ],
    }),

    uploadGeneralAttachment: builder.mutation<
      ReportAttachment,
      UploadAttachmentArgs
    >({
      query: ({ reportId, file, name, documentType, description }) => {
        const formData = new FormData();
        formData.append("file", file);

        if (name) {
          formData.append("name", name);
        }

        if (documentType) {
          formData.append("documentType", documentType);
        }

        if (description) {
          formData.append("description", description);
        }

        return {
          url: `/partner-reports/${reportId}/attachments`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { reportId }) => [
        { type: "ReportAttachment", id: `general-${reportId}` },
      ],
    }),

    // =====================================================
    // Pièces justificatives techniques
    // =====================================================
    getTechnicalAttachments: builder.query<
      ReportAttachment[],
      TechnicalAttachmentsArgs
    >({
      query: ({ reportId, technicalItemId }) =>
        `/partner-reports/${reportId}/technical-items/${technicalItemId}/attachments`,
      providesTags: (_result, _error, { technicalItemId }) => [
        {
          type: "ReportAttachment",
          id: `technical-${technicalItemId}`,
        },
      ],
    }),

    uploadTechnicalAttachment: builder.mutation<
      ReportAttachment,
      UploadTechnicalAttachmentArgs
    >({
      query: ({
        reportId,
        technicalItemId,
        file,
        name,
        documentType,
        description,
      }) => {
        const formData = new FormData();
        formData.append("file", file);

        if (name) {
          formData.append("name", name);
        }

        if (documentType) {
          formData.append("documentType", documentType);
        }

        if (description) {
          formData.append("description", description);
        }

        return {
          url: `/partner-reports/${reportId}/technical-items/${technicalItemId}/attachments`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { technicalItemId }) => [
        {
          type: "ReportAttachment",
          id: `technical-${technicalItemId}`,
        },
      ],
    }),

    // =====================================================
    // Pièces justificatives financières
    // =====================================================
    getFinancialAttachments: builder.query<
      ReportAttachment[],
      FinancialAttachmentsArgs
    >({
      query: ({ reportId, financialItemId }) =>
        `/partner-reports/${reportId}/financial-items/${financialItemId}/attachments`,
      providesTags: (_result, _error, { financialItemId }) => [
        {
          type: "ReportAttachment",
          id: `financial-${financialItemId}`,
        },
      ],
    }),

    uploadFinancialAttachment: builder.mutation<
      ReportAttachment,
      UploadFinancialAttachmentArgs
    >({
      query: ({
        reportId,
        financialItemId,
        file,
        name,
        documentType,
        description,
      }) => {
        const formData = new FormData();
        formData.append("file", file);

        if (name) {
          formData.append("name", name);
        }

        if (documentType) {
          formData.append("documentType", documentType);
        }

        if (description) {
          formData.append("description", description);
        }

        return {
          url: `/partner-reports/${reportId}/financial-items/${financialItemId}/attachments`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { financialItemId }) => [
        {
          type: "ReportAttachment",
          id: `financial-${financialItemId}`,
        },
      ],
    }),

    // =====================================================
    // Suppression commune
    // Attention : le backend doit exposer DELETE pour l'activer.
    // =====================================================
    deleteReportAttachment: builder.mutation<void, DeleteAttachmentArgs>({
      query: ({ reportId, attachmentId }) => ({
        url: `/partner-reports/${reportId}/attachments/${attachmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ReportAttachment", id: `general-${arg.reportId}` },
        ...(arg.technicalItemId
          ? [
              {
                type: "ReportAttachment" as const,
                id: `technical-${arg.technicalItemId}`,
              },
            ]
          : []),
        ...(arg.financialItemId
          ? [
              {
                type: "ReportAttachment" as const,
                id: `financial-${arg.financialItemId}`,
              },
            ]
          : []),
      ],
    }),

    // =====================================================
    // Téléchargement commun
    // =====================================================
    downloadReportAttachment: builder.mutation<Blob, DownloadAttachmentArgs>({
      query: ({ reportId, attachmentId }) => ({
        url: `/partner-reports/${reportId}/attachments/${attachmentId}/download`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGeneralAttachmentsQuery,
  useUploadGeneralAttachmentMutation,

  useGetTechnicalAttachmentsQuery,
  useUploadTechnicalAttachmentMutation,

  useGetFinancialAttachmentsQuery,
  useUploadFinancialAttachmentMutation,

  useDeleteReportAttachmentMutation,
  useDownloadReportAttachmentMutation,
} = reportAttachmentApi;
