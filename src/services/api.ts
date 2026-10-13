import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import type { RootState } from "@/app/store";
import { logout, setCredentials } from "@/features/Auth/authSlice";
import type { AuthResponse } from "@/features/Auth/auth.types";

export const tagTypes = [
  "Region",
  "District",
  "Municipality",
  "Landscape",
  "SubLandscape",
  "StrategicPlan",
  "BoardMember",
  "Department",
  "Position",
  "Employee",
  "LocalOrganization",
  "SupportPartner",
  "PartnerContact",
  "CoFunder",
  "Topic",
  "Project",
  "Role",
  "DisbursementSchedule",
] as const;
export type TagType = (typeof tagTypes)[number];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include", // envoie le cookie HttpOnly du refresh token
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Évite plusieurs refresh simultanés si plusieurs requêtes reçoivent un 401
const mutex = new Mutex();

// Pour ces URLs, un 401 ne doit pas déclencher de refresh
const AUTH_URLS = ["/auth/login", "/auth/refresh", "/auth/logout"];
const isAuthUrl = (args: string | FetchArgs) => {
  const url = typeof args === "string" ? args : args.url;
  return AUTH_URLS.some((p) => url.startsWith(p));
};

const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401 || isAuthUrl(args)) {
    return result;
  }

  if (!mutex.isLocked()) {
    const release = await mutex.acquire();

    try {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        api.dispatch(setCredentials(refreshResult.data as AuthResponse));

        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } finally {
      release();
    }
  } else {
    await mutex.waitForUnlock();

    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes,
  endpoints: () => ({}), // injectés par chaque feature
});
