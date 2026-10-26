import { api } from "@/services/api";
import { normalizePage, type Page, type PageParams } from "@/types/common";

import type { Project, ProjectDetail, ProjectRequest } from "./project.types";

const LIST = {
  type: "Project" as const,
  id: "LIST" as const,
};

export const projectApi = api.injectEndpoints({
  endpoints: (build) => ({
    // =====================================================
    // LIST
    // =====================================================

    getProjects: build.query<Page<Project>, PageParams>({
      query: ({ page, size }) => ({
        url: "/projects",
        params: {
          page,
          size,
        },
      }),

      transformResponse: (raw: unknown) => normalizePage<Project>(raw),

      providesTags: (result) => [
        LIST,

        ...(result?.content ?? []).map((project) => ({
          type: "Project" as const,
          id: project.id,
        })),
      ],
    }),

    getMyPartnerProjects: build.query<Page<Project>, PageParams>({
      query: ({ page, size }) => ({
        url: "/projects/partner",
        params: { page, size },
      }),

      transformResponse: (raw: unknown) => normalizePage<Project>(raw),

      providesTags: (result) => [
        LIST,
        ...(result?.content ?? []).map((project) => ({
          type: "Project" as const,
          id: project.id,
        })),
      ],
    }),

    // =====================================================
    // DETAIL
    // =====================================================
    getProjectById: build.query<ProjectDetail, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Project", id }],
    }),

    // =====================================================
    // CREATE
    // =====================================================

    createProject: build.mutation<string, ProjectRequest>({
      query: (body) => ({
        url: "/projects/create",
        method: "POST",
        body,
        responseHandler: "text",
      }),

      invalidatesTags: [LIST],
    }),

    // =====================================================
    // UPDATE
    // =====================================================

    updateProject: build.mutation<string, ProjectRequest & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/projects/update/${id}`,
        method: "PUT",
        body,
        responseHandler: "text",
      }),

      invalidatesTags: (_result, _error, { id }) => [
        LIST,
        {
          type: "Project",
          id,
        },
      ],
    }),

    // =====================================================
    // DELETE
    // =====================================================

    deleteProject: build.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, id) => [
        LIST,
        {
          type: "Project",
          id,
        },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetMyPartnerProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
