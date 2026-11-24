export type UserType =
  | "EMPLOYEE"
  | "PARTNER_CONTACT"
  | "BOARD_MEMBER"
  | "ADMIN"
  | "USER";

export interface BaseUserResponse {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  enabled: boolean;
  roles: string[];
}

export type CurrentUserResponse =
  | (BaseUserResponse & {
      userType: "EMPLOYEE";
      profile: EmployeeProfile;
    })
  | (BaseUserResponse & {
      userType: "PARTNER_CONTACT";
      profile: PartnerContactProfile;
    })
  | (BaseUserResponse & {
      userType: "BOARD_MEMBER";
      profile: BoardMemberProfile;
    })
  | (BaseUserResponse & {
      userType: "ADMIN" | "USER";
      profile: null;
    });

export interface EmployeeProfile {
  id: string;
  firstname: string;
  lastname: string;
  employee_number: string;
  acronym: string;
  personal_email: string;
  professional_email: string;
  phone: string;
  address: string;
  hire_date: string;
  department: ShortDepartment;
  position: ShortPosition;
}

export interface ShortPosition {
  id: string;
  code: string;
  name: string;
}

export interface ShortDepartment {
  id: string;
  code: string;
  name: string;
}

export interface PartnerContactProfile {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  supportPartner: ShortSupportPartner;
}

export interface ShortSupportPartner {
  id: string;
  name: string;
}

export interface BoardMemberProfile {
  id: string;
  firstname: string;
  lastname: string;
  personal_email: string;
  professional_email: string;
  phone: string;
  address: string;
  position: string;
  appointment_date: string;
  end_date: string;
}

export interface UserDetailResponse {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  userType: UserType;
  enabled: boolean;
  roles: RoleResponse[];
  permissions: PermissionResponse[];
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
}

export interface PermissionResponse {
  id: string;
  name: string;
  description: string;
}
