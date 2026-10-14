import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import { blankToNull } from "@/utils/strings";
import type { ShortSupportPartner, SupportPartner, SupportPartnerInput } from "./supportPartner.types";

const LIST = { type: "SupportPartner" as const, id: "LIST" as const };

// Les champs facultatifs vides partent en null
const toBody = (v: SupportPartnerInput) => ({
  name: v.name.trim(),
  address: blankToNull(v.address),
  phone: blankToNull(v.phone),
  email: blankToNull(v.email.trim()),
});

export const supportPartnerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSupportPartners: build.query<Page<SupportPartner>, PageParams>({
      query: ({ page, size }) => ({ url: "/partners", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<SupportPartner>(raw),
      providesTags: providesList<SupportPartner>("SupportPartner"),
    }),

    // À confirmer : GET /partners/all renvoyant des ShortSupportPartnerResponse
    getAllSupportPartners: build.query<ShortSupportPartner[], void>({
      query: () => "/partners/all",
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "SupportPartner" as const, id })),
        { type: "SupportPartner" as const, id: "LIST" as const },
      ],
    }),

    // Le backend renvoie une String (texte brut)
    addSupportPartner: build.mutation<string, SupportPartnerInput>({
      query: (values) => ({
        url: "/partners/create",
        method: "POST",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateSupportPartner: build.mutation<string, SupportPartnerInput & { id: string }>({
      query: ({ id, ...values }) => ({
        url: `/partners/update/${id}`,
        method: "PUT",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "SupportPartner", id }, LIST],
    }),

    deleteSupportPartner: build.mutation<void, string>({
      query: (id) => ({ url: `/partners/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetSupportPartnersQuery,
  useGetAllSupportPartnersQuery,
  useAddSupportPartnerMutation,
  useUpdateSupportPartnerMutation,
  useDeleteSupportPartnerMutation,
} = supportPartnerApi;