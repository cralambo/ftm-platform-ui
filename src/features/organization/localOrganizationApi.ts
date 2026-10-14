import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import { blankToNull } from "@/utils/strings";
import type { LocalOrganization, LocalOrganizationInput, ShortLocalOrganization } from "./localOrganization.types";

const LIST = { type: "LocalOrganization" as const, id: "LIST" as const };

// Les champs facultatifs vides partent en null
const toBody = (v: LocalOrganizationInput) => ({
  name: v.name.trim(),
  address: blankToNull(v.address),
  phone: blankToNull(v.phone),
  email: blankToNull(v.email.trim()),
});

export const localOrganizationApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLocalOrganizations: build.query<Page<LocalOrganization>, PageParams>({
      query: ({ page, size }) => ({ url: "/organizations", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<LocalOrganization>(raw),
      providesTags: providesList<LocalOrganization>("LocalOrganization"),
    }),

    getAllLocalOrganizations: build.query<ShortLocalOrganization[], void>({
      query: () => "/organizations/all",
      providesTags: (result) => [
            ...(result ?? []).map(({ id }) => ({ type: "LocalOrganization" as const, id })),
      { type: "LocalOrganization" as const, id: "LIST" as const },
      ],
    }),

    // Le backend renvoie une String (texte brut)
    addLocalOrganization: build.mutation<string, LocalOrganizationInput>({
      query: (values) => ({
        url: "/organizations/create",
        method: "POST",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateLocalOrganization: build.mutation<string, LocalOrganizationInput & { id: string }>({
      query: ({ id, ...values }) => ({
        url: `/organizations/update/${id}`,
        method: "PUT",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "LocalOrganization", id }, LIST],
    }),

    deleteLocalOrganization: build.mutation<void, string>({
      query: (id) => ({ url: `/organizations/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetLocalOrganizationsQuery,
  useGetAllLocalOrganizationsQuery,
  useAddLocalOrganizationMutation,
  useUpdateLocalOrganizationMutation,
  useDeleteLocalOrganizationMutation,
} = localOrganizationApi;