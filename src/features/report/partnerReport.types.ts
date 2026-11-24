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

export interface SubmitPartnerReportRequest {
  general_comments?: string | null;
}

export interface PartnerReportSubmitted {
  id: EntityId;
  disbursement_schedule: DisbursementSchedule;
  partner_contact: PartnerContact;
  status: ReportStatus;
  general_comments: string;
  assigned_to: string | null;
  assigned_at: string | null;
  submitted_at: string | null;
}

interface DisbursementSchedule {
  id: EntityId;
  reference: string;
  disbursement_month: string;
  disbursement_amount: string;
  percentage: string;
  report_submission_date: string;
  project: ShortProject;
}

interface PartnerContact {
  id: EntityId;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  supportPartner: ShortSupportPartner;
}

interface ShortProject {
  id: EntityId;
  agreement_number: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  granted_project: GrantedProject;
}

interface ShortSupportPartner {
  id: EntityId;
  name: string;
}

interface GrantedProject {
  id: EntityId;
  grant_date: string;
  grant_amount: string;
}

export interface ReportAttachment {
  id: string;
  original_filename: string;
  name: string;
  content_type: string | null;
  file_size: number;
  document_type: string | null;
  description: string | null;
  uploaded_by: string;
  uploaded_at: string;
}

export interface TechnicalReportItem {
  id: string;
  disbursement_activity_id: string;
  activity_name: string | null;
  achieved_quantity: string | null;
  unit: string | null;
  result_description: string | null;
  observations: string | null;
  documents: ReportAttachment[];
}

export interface FinancialReportItem {
  id: string;
  designation: string;
  quantity: string;
  unit_amount: string;
  total_amount: string;
  observations: string | null;
  documents: ReportAttachment[];
}

export interface PartnerReportDetail {
  id: string;

  disbursement_schedule: {
    id: string;
    reference: string;
    disbursement_month: string;
    disbursement_amount: string;
    percentage: string;
    report_submission_date: string;
    project: {
      id: string;
      agreement_number: string;
      title: string;
      start_date: string;
      end_date: string;
      status: string;
      granted_project: {
        id: string;
        grant_date: string;
        grant_amount: string;
      } | null;
    };
  };

  partner_contact: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    supportPartner: {
      id: string;
      name: string;
    };
  };

  status: string;
  general_comments: string;
  assigned_to: string | null;
  assigned_at: string | null;
  submitted_at: string | null;

  technical_report: TechnicalReportItem[];
  financial_report: FinancialReportItem[];
  documents: ReportAttachment[];
}
