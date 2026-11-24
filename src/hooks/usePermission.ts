import { useAppSelector } from "@/app/hooks";

export function usePermission() {
  const user = useAppSelector((state) => state.auth.user);

  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];

  const hasPermission = (permission: string): boolean =>
    permissions.includes(permission);

  const hasAnyPermission = (required: string[]): boolean =>
    required.some(hasPermission);

  const hasAllPermissions = (required: string[]): boolean =>
    required.every(hasPermission);

  const hasRole = (role: string): boolean => roles.includes(role);

  const hasAnyRole = (required: string[]): boolean => required.some(hasRole);

  return {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  };
}
