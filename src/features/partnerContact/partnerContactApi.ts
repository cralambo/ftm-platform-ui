import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import { blankToNull } from "@/utils/strings";
import type { PartnerContact, PartnerContactInput } from "./partnerContact.types";

const LIST = { type: "PartnerContact" as const, id: "LIST" as const };

// Les champs facultatifs vides partent en null
const toBody = (v: PartnerContactInput) => ({
  firstname: v.firstname.trim(),
  lastname: v.lastname.trim(),
  email: v.email.trim(),
  phone: blankToNull(v.phone),
  address: blankToNull(v.address),
  support_partner_id: v.support_partner_id,
});

export const partnerContactApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPartnerContacts: build.query<Page<PartnerContact>, PageParams>({
      query: ({ page, size }) => ({ url: "/partner-contacts", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<PartnerContact>(raw),
      providesTags: providesList<PartnerContact>("PartnerContact"),
    }),

    // Le backend renvoie une String (texte brut)
    addPartnerContact: build.mutation<string, PartnerContactInput>({
      query: (values) => ({
        url: "/partner-contacts/create",
        method: "POST",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updatePartnerContact: build.mutation<string, PartnerContactInput & { id: string }>({
      query: ({ id, ...values }) => ({
        url: `/partner-contacts/update/${id}`,
        method: "PUT",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "PartnerContact", id }, LIST],
    }),

    deletePartnerContact: build.mutation<void, string>({
      query: (id) => ({ url: `/partner-contacts/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetPartnerContactsQuery,
  useAddPartnerContactMutation,
  useUpdatePartnerContactMutation,
  useDeletePartnerContactMutation,
} = partnerContactApi;