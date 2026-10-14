import { api } from "@/services/api";
import { logout as logoutAction, setCredentials } from "./authSlice";
import type { AuthResponse, LoginRequest } from "./auth.types";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),

    refresh: build.mutation<AuthResponse, void>({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* pas de session valide : on reste déconnecté */
        }
      },
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          /* même si le serveur échoue, on déconnecte localement */
        }
        dispatch(logoutAction());
        dispatch(api.util.resetApiState()); // vide tout le cache
      },
    }),
  }),
});

export const { useLoginMutation, useRefreshMutation, useLogoutMutation } = authApi;