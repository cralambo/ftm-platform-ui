import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { Role, RoleInput } from "./role.types";
import type { Permission } from "../permission/permission.types";

const LIST = { type: "Role" as const, id: "LIST" as const };

export const roleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<Page<Role>, PageParams>({
      query: ({ page, size }) => ({
        url: "/roles",
        params: { page, size },
      }),
      transformResponse: (raw: unknown) => normalizePage<Role>(raw),
      providesTags: providesList<Role>("Role"),
    }),

    getAllRoles: build.query<Role[], void>({
      query: () => ({
        url: "/roles/all",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Role" as const,
                id,
              })),
              LIST,
            ]
          : [LIST],
    }),

    getRolePermissions: build.query<Permission[], string>({
      query: (roleId) => `/roles/${roleId}/permissions`,
      providesTags: (_result, _error, roleId) => [{ type: "Role", id: roleId }],
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
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [LIST],
    }),

    // Ajouter une permission à un rôle
    addPermissionToRole: build.mutation<
      string,
      { roleId: string; permissionId: string }
    >({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: "POST",
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { roleId }) => [
        { type: "Role", id: roleId },
        LIST,
      ],
    }),

    // Retirer une permission d'un rôle
    removePermissionFromRole: build.mutation<
      string,
      { roleId: string; permissionId: string }
    >({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { roleId }) => [
        { type: "Role", id: roleId },
        LIST,
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetAllRolesQuery,
  useLazyGetRolePermissionsQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAddPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
} = roleApi;
