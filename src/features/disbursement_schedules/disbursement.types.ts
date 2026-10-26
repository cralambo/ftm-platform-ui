import type { Project } from "../project/project.types";

export type EntityId = string | number;

export type ActivityType = "QUANTITATIVE" | "QUALITATIVE";

export interface DisbursementScheduleDetail {
  id: EntityId;
  reference: string;
  disbursement_month: string;
  disbursement_amount: number;
  percentage: number;
  report_submission_date: string | null;
  project: Project;
}

export interface DisbursementActivity {
  id: EntityId;
  Schedule_Id: EntityId;
  type: ActivityType;
  name: string;
  description?: string | null;

  // Activité quantitative
  target_quantity?: number | string | null;
  unit?: string | null;

  // Activité qualitative
  success_criteria?: string | null;
}

export interface QuantitativeActivityPayload {
  type: "QUANTITATIVE";
  name: string;
  description?: string;
  target_quantity: number;
  unit: string;
}

export interface QualitativeActivityPayload {
  type: "QUALITATIVE";
  name: string;
  description?: string;
  success_criteria: string;
}

export type ActivityPayload =
  | QuantitativeActivityPayload
  | QualitativeActivityPayload;
