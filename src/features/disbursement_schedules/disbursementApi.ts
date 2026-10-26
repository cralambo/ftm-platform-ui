import { api } from "@/services/api";

import type {
  DisbursementActivity,
  DisbursementScheduleDetail,
  ActivityPayload,
  EntityId,
} from "./disbursement.types";

// =====================================================
// TAGS
// =====================================================

const SCHEDULE_LIST = {
  type: "DisbursementSchedule" as const,
  id: "LIST" as const,
};

const ACTIVITY_LIST = (scheduleId: EntityId) => ({
  type: "DisbursementActivity" as const,
  id: `LIST-${scheduleId}`,
});

// =====================================================
// API
// =====================================================

export const disbursementApi = api
  .enhanceEndpoints({
    addTagTypes: ["DisbursementSchedule", "DisbursementActivity"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // =====================================================
      // SCHEDULE DETAIL
      // =====================================================

      getDisbursementSchedule: build.query<
        DisbursementScheduleDetail,
        EntityId
      >({
        query: (id) => `/disbursement-schedules/${id}`,

        providesTags: (_result, _error, id) => [
          {
            type: "DisbursementSchedule",
            id,
          },
        ],
      }),

      // =====================================================
      // LIST ACTIVITIES
      // =====================================================

      getScheduleActivities: build.query<DisbursementActivity[], EntityId>({
        query: (scheduleId) =>
          `/disbursement-activities/${scheduleId}/activities`,

        providesTags: (result, _error, scheduleId) => [
          ACTIVITY_LIST(scheduleId),

          ...(result ?? []).map((activity) => ({
            type: "DisbursementActivity" as const,
            id: activity.id,
          })),
        ],
      }),

      // =====================================================
      // CREATE ACTIVITY
      // =====================================================

      createActivity: build.mutation<
        DisbursementActivity,
        {
          scheduleId: EntityId;
          body: ActivityPayload;
        }
      >({
        query: ({ scheduleId, body }) => ({
          url: `/disbursement-activities/${scheduleId}/activities`,
          method: "POST",
          body,
        }),

        invalidatesTags: (_result, _error, { scheduleId }) => [
          ACTIVITY_LIST(scheduleId),
          {
            type: "DisbursementSchedule",
            id: scheduleId,
          },
          SCHEDULE_LIST,
        ],
      }),

      // =====================================================
      // UPDATE ACTIVITY
      // =====================================================

      updateActivity: build.mutation<
        DisbursementActivity,
        {
          id: EntityId;
          scheduleId: EntityId;
          body: ActivityPayload;
        }
      >({
        query: ({ id, body }) => ({
          url: `/disbursement-activities/${id}`,
          method: "PUT",
          body,
        }),

        invalidatesTags: (_result, _error, { id, scheduleId }) => [
          {
            type: "DisbursementActivity",
            id,
          },
          ACTIVITY_LIST(scheduleId),
          {
            type: "DisbursementSchedule",
            id: scheduleId,
          },
          SCHEDULE_LIST,
        ],
      }),

      // =====================================================
      // DELETE ACTIVITY
      // =====================================================

      deleteActivity: build.mutation<
        void,
        {
          id: EntityId;
          scheduleId: EntityId;
        }
      >({
        query: ({ id }) => ({
          url: `/disbursement-activities/${id}`,
          method: "DELETE",
        }),

        invalidatesTags: (_result, _error, { id, scheduleId }) => [
          {
            type: "DisbursementActivity",
            id,
          },
          ACTIVITY_LIST(scheduleId),
          {
            type: "DisbursementSchedule",
            id: scheduleId,
          },
          SCHEDULE_LIST,
        ],
      }),
    }),

    overrideExisting: false,
  });

// =====================================================
// HOOKS
// =====================================================

export const {
  useGetDisbursementScheduleQuery,
  useGetScheduleActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
} = disbursementApi;
