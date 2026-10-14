import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import { blankToNull } from "@/utils/strings";
import type { BoardMember, BoardMemberInput } from "./boardMember.types";

const LIST = { type: "BoardMember" as const, id: "LIST" as const };

// Les champs facultatifs vides partent en null
const toBody = (v: BoardMemberInput) => ({
  firstname: v.firstname.trim(),
  lastname: v.lastname.trim(),
  personal_email: blankToNull(v.personal_email),
  professional_email: v.professional_email.trim(),
  phone: blankToNull(v.phone),
  address: blankToNull(v.address),
  position: v.position.trim(),
  appointment_date: v.appointment_date,
  end_date: blankToNull(v.end_date),
});

export const boardMemberApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBoardMembers: build.query<Page<BoardMember>, PageParams>({
      query: ({ page, size }) => ({ url: "/board-members", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<BoardMember>(raw),
      providesTags: providesList<BoardMember>("BoardMember"),
    }),

    // Le backend renvoie une String (texte brut)
    addBoardMember: build.mutation<string, BoardMemberInput>({
      query: (values) => ({
        url: "/board-members/create",
        method: "POST",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateBoardMember: build.mutation<string, BoardMemberInput & { id: string }>({
      query: ({ id, ...values }) => ({
        url: `/board-members/update/${id}`,
        method: "PUT",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "BoardMember", id }, LIST],
    }),

    deleteBoardMember: build.mutation<void, string>({
      query: (id) => ({ url: `/board-members/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetBoardMembersQuery,
  useAddBoardMemberMutation,
  useUpdateBoardMemberMutation,
  useDeleteBoardMemberMutation,
} = boardMemberApi;