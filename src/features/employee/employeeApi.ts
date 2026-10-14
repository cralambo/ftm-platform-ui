import { api } from "@/services/api";
import { providesList } from "@/services/tags";
import { normalizePage, type Page, type PageParams } from "@/types/common";
import { blankToNull } from "@/utils/strings";
import type { Employee, EmployeeInput } from "./employee.types";

const LIST = { type: "Employee" as const, id: "LIST" as const };

// Les champs facultatifs vides partent en null
const toBody = (v: EmployeeInput) => ({
  firstname: v.firstname.trim(),
  lastname: v.lastname.trim(),
  employee_number: v.employee_number.trim(),
  acronym: blankToNull(v.acronym),
  personal_email: blankToNull(v.personal_email),
  professional_email: v.professional_email.trim(),
  phone: blankToNull(v.phone),
  address: blankToNull(v.address),
  hire_date: v.hire_date,
  position_id: v.position_id,
  department_id: v.department_id,
});

export const employeeApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEmployees: build.query<Page<Employee>, PageParams>({
      query: ({ page, size }) => ({ url: "/employees", params: { page, size } }),
      transformResponse: (raw: unknown) => normalizePage<Employee>(raw),
      providesTags: providesList<Employee>("Employee"),
    }),

    // Le backend renvoie une String (texte brut)
    addEmployee: build.mutation<string, EmployeeInput>({
      query: (values) => ({
        url: "/employees/create",
        method: "POST",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: [LIST],
    }),

    updateEmployee: build.mutation<string, EmployeeInput & { id: string }>({
      query: ({ id, ...values }) => ({
        url: `/employees/update/${id}`,
        method: "PUT",
        body: toBody(values),
        responseHandler: "text",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Employee", id }, LIST],
    }),

    deleteEmployee: build.mutation<void, string>({
      query: (id) => ({ url: `/employees/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;