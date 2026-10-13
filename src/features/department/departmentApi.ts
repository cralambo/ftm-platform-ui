import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import { blankToNull } from "@/utils/strings";
import type { Department, DepartmentInput, ShortDepartment } from "./department.types";

const LIST = { type: "Department" as const, id: "LIST" as const };

// Description vide → null
const toBody = (v: DepartmentInput) => ({
  code: v.code.trim(),
  name: v.name.trim(),
  description: blankToNull(v.description),
});

export const departmentApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDepartments: build.query<Page<Department>, PageParams>({
      query: ({ page, size }) => ({ url: "/departments", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<Department>(raw),
      providesTags: providesList<Department>("Department"),
    }),

    // À confirmer : GET /departments/all renvoyant des ShortDepartmentResponse.
    // Utile pour les listes déroulantes (positions, employés…).
    getAllDepartments: build.query<ShortDepartment[], void>({
      query: () => "/departments/all",
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "Department" as const, id })),
        LIST,
      ],
    }),

    // Le backend renvoie une String (texte brut)
    addDepartment: build.mutation<string, DepartmentInput>({
      query: (values) => ({
        url: "/departments/create",
        method: "POST",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateDepartment: build.mutation<string, DepartmentInput & { id: string }>({
      query: ({ id, ...values }) => ({
        url: `/departments/update/${id}`,
        method: "PUT",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [
            { type: "Department", id },
            LIST,
            { type: "Employee", id: "LIST" },
        ],
    }),

    deleteDepartment: build.mutation<void, string>({
      query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST, { type: "Employee", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetAllDepartmentsQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;