export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  firstname: string;
  lastname: string;
  userType: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  userType: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}
