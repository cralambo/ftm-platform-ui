import { api } from "@/services/api";
import { blankToNull } from "@/utils/strings";
import type { DisbursementScheduleInput } from "./disbursementSchedule.types";

const LIST = { type: "DisbursementSchedule" as const, id: "LIST" as const };

const toBody = (v: DisbursementScheduleInput) => ({
  reference: v.reference.trim(),
  disbursement_month: blankToNull(v.disbursement_month.trim()),
  disbursement_amount:
    v.disbursement_amount === "" ? null : String(v.disbursement_amount),
  percentage: v.percentage === "" ? null : String(v.percentage),
  report_submission_date: blankToNull(v.report_submission_date.trim()),
  project_id: v.project_id.trim(),
});

export const disbursementScheduleApi = api.injectEndpoints({
  endpoints: (build) => ({
    addDisbursementSchedule: build.mutation<string, DisbursementScheduleInput>({
      query: (values) => ({
        url: "/disbursement-schedules/create",
        method: "POST",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: (_result, _error, values) => [
        LIST,
        { type: "Project", id: values.project_id },
      ],
    }),
  }),
});

export const { useAddDisbursementScheduleMutation } = disbursementScheduleApi;
