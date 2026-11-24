import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import type { Permission, PermissionInput } from "./permission.types";

const LIST = { type: "Permission" as const, id: "LIST" as const };

export const permissionApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPermissions: build.query<Page<Permission>, PageParams>({
      query: ({ page, size }) => ({
        url: "/permissions",
        params: { page, size },
      }),
      transformResponse: (raw: unknown) => normalizePage<Permission>(raw),
      providesTags: providesList<Permission>("Permission"),
    }),

    getAllPermissions: build.query<Permission[], void>({
      query: () => ({
        url: "/permissions/all",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Permission" as const,
                id,
              })),
              { type: "Permission" as const, id: "LIST" },
            ]
          : [{ type: "Permission" as const, id: "LIST" }],
    }),

    addPermission: build.mutation<string, PermissionInput>({
      query: ({ name, description }) => ({
        url: "/permissions/create",
        method: "POST",
        body: { name, description },
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updatePermission: build.mutation<string, PermissionInput & { id: string }>({
      query: ({ id, name, description }) => ({
        url: `/permissions/update/${id}`,
        method: "PUT",
        body: { name, description },
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Permission", id }, LIST],
    }),

    deletePermission: build.mutation<void, string>({
      query: (id) => ({ url: `/permissions/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, { type: "Permission", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetAllPermissionsQuery,
  useAddPermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionApi;
