import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { Role, RoleInput } from "./role.types";

const LIST = { type: "District" as const, id: "LIST" as const };

export const roleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<Page<Role>, PageParams>({
      query: ({ page, size }) => ({ url: "/roles", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<Role>(raw),
      providesTags: providesList<Role>("Role"),
    }),

    addRole: build.mutation<string, RoleInput>({
      query: ({ name, description }) => ({
        url: "/roles/create",
        method: "POST",
        body: { name, description },
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateRole: build.mutation<string, RoleInput & { id: string }>({
      query: ({ id, name, description }) => ({
        url: `/roles/update/${id}`,
        method: "PUT",
        body: { name, description },
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Role", id }, LIST],
    }),

    deleteRole: build.mutation<void, string>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, { type: "Role", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
