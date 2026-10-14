import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import { blankToNull } from "@/utils/strings";
import type { ShortTopic, Topic, TopicInput } from "./topic.types";

const LIST = { type: "Topic" as const, id: "LIST" as const };

// Description vide → null
const toBody = (v: TopicInput) => ({
  name: v.name.trim(),
  description: blankToNull(v.description),
});

export const topicApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTopics: build.query<Page<Topic>, PageParams>({
      query: ({ page, size }) => ({ url: "/topics", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<Topic>(raw),
      providesTags: providesList<Topic>("Topic"),
    }),

    // Liste complète (ShortTopicResponse) pour le formulaire de projet
    getAllTopics: build.query<ShortTopic[], void>({
      query: () => "/topics/all",
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "Topic" as const, id })),
        LIST,
      ],
    }),

    // Le backend renvoie une String (texte brut)
    addTopic: build.mutation<string, TopicInput>({
      query: (values) => ({
        url: "/topics/create",
        method: "POST",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateTopic: build.mutation<string, TopicInput & { id: string }>({
      query: ({ id, ...values }) => ({
        url: `/topics/update/${id}`,
        method: "PUT",
        body: toBody(values),
        responseHandler: "text",
      }),
      // Quand l'API des projets existera, invalidez aussi sa liste ici :
      // le nom du topic apparaît dans les projets.
      invalidatesTags: (_r, _e, { id }) => [{ type: "Topic", id }, LIST],
    }),

    deleteTopic: build.mutation<void, string>({
      query: (id) => ({ url: `/topics/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useGetAllTopicsQuery,
  useAddTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicApi;