import type { ChipProps } from "@mui/material";

/**
 * Statuts des projets
 */
export const PROJECT_STATUS_COLORS: Record<string, ChipProps["color"]> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  CANCELED: "error",
  COMPLETED: "success",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  CANCELED: "Annulé",
  COMPLETED: "Terminé",
};

export const getProjectStatusLabel = (status: string): string =>
  PROJECT_STATUS_LABELS[status] ?? status;

export const getProjectStatusColor = (status: string): ChipProps["color"] =>
  PROJECT_STATUS_COLORS[status] ?? "default";

/**
 * Types de documents
 */
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  OFFICIAL_LETTER: "Lettre officielle",
  OTHER: "Autre document",
  TECHNICAL_SUPPORT: "Justificatif technique",
  FINANCIAL_SUPPORT: "Justificatif financier",
  CONTRACT: "Contrat",
  REQUEST_FOR_NEXT_DISBURSEMENT: "Demande de prochain décaissement",
};

export const getDocumentTypeLabel = (type: string): string =>
  DOCUMENT_TYPE_LABELS[type] ?? type;

/**
 * Statuts des rapports partenaires
 */
export const REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  UNDER_REVIEW: "En cours d'examen",
  RETURNED: "Retourné pour correction",
  IN_VALIDATION: "En cours de validation",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

export const getReportStatusLabel = (status: string): string =>
  REPORT_STATUS_LABELS[status] ?? status;
