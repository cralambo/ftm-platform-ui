import type { ShortDepartment } from "@/features/department/department.types";
import type { ShortPosition } from "@/features/position/position.types";

// Noms identiques à ceux du backend (snake_case)
export interface Employee {
  id: string;
  firstname: string;
  lastname: string;
  employee_number: string;
  acronym: string | null;
  personal_email: string | null;
  professional_email: string;
  phone: string | null;
  address: string | null;
  hire_date: string; // "YYYY-MM-DD"
  department: ShortDepartment | null;
  position: ShortPosition | null;
}

// Valeurs du formulaire : des chaînes (vides si non renseigné)
export interface EmployeeInput {
  firstname: string;
  lastname: string;
  employee_number: string;
  acronym: string;
  personal_email: string;
  professional_email: string;
  phone: string;
  address: string;
  hire_date: string;
  position_id: string;
  department_id: string;
}