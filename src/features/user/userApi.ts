import { api } from "@/services/api";
import type {
  CurrentUserResponse,
  UserDetailResponse,
} from "@/features/user/user.types";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import { providesList } from "@/services/tags";

interface UserRoleParams {
  userId: string;
  roleId: string;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Utilisateur connecté
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["CurrentUser"],
    }),

    // Liste paginée des utilisateurs avec leurs autorités
    getAllUsersWithAuthorities: builder.query<
      Page<UserDetailResponse>,
      PageParams
    >({
      query: ({ page, size }) => ({
        url: "/users/list",
        params: { page, size },
      }),
      transformResponse: (raw: unknown) =>
        normalizePage<UserDetailResponse>(raw),
      providesTags: providesList<UserDetailResponse>("UserDetailResponse"),
    }),

    // Ajouter un rôle à un utilisateur
    addRoleToUser: builder.mutation<string, UserRoleParams>({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/roles/${roleId}`,
        method: "POST",
        responseHandler: "text",
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "UserDetailResponse", id: userId },
        { type: "UserDetailResponse", id: "LIST" },
        "CurrentUser",
      ],
    }),

    // Retirer un rôle d'un utilisateur
    removeRoleFromUser: builder.mutation<string, UserRoleParams>({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/roles/${roleId}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "UserDetailResponse", id: userId },
        { type: "UserDetailResponse", id: "LIST" },
        "CurrentUser",
      ],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetAllUsersWithAuthoritiesQuery,
  useAddRoleToUserMutation,
  useRemoveRoleFromUserMutation,
} = userApi;
