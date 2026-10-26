// src/features/partner_reports/partnerReport.types.ts

export type EntityId = string;

/** DRAFT, SUBMITTED, IN_VERIFICATION, IN_VALIDATION, VALIDATED, REJECTED… (selon ton enum Java) */
export type ReportStatus = string;

/** PartnerReportResponse : adapte aux champs réels du record Java. */
export interface PartnerReport {
  id: EntityId;
  status: ReportStatus;
  general_comments?: string | null;
  disbursement_schedule_id?: EntityId;
  created_at?: string | null;
  updated_at?: string | null;
}

/** FinancialSummaryDto : chaque champ renvoyé est affiché par la page. */
export type FinancialSummary = Record<string, string | number | boolean | null>;

/** PartnerReportDetailResponse */
export interface PartnerReportWithSummary {
  report: PartnerReport;
  financial_summary: FinancialSummary | null;
}

/** CreatePartnerReportRequest */
export interface PartnerReportCreateInput {
  disbursement_schedule_id: EntityId;
}

/** UpdatePartnerReportRequest : adapte aux champs réels. */
export interface PartnerReportUpdateInput {
  general_comments?: string;
}
