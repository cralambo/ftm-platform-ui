export interface DisbursementSchedule {
  id: string;
  reference: string;
  disbursement_month: string;
  disbursement_amount: string;
  percentage: string;
  report_submission_date: string;
  project_id: string;
}

export interface DisbursementScheduleInput {
  reference: string;
  disbursement_month: string;
  disbursement_amount: string;
  percentage: string;
  report_submission_date: string;
  project_id: string;
}
