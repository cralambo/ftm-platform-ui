import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

interface PermissionGuardProps {
  permissions: string[];
  requireAll?: boolean;
  redirectTo?: string;
}

const PermissionGuard = ({
  permissions,
  requireAll = false,
  redirectTo = "/unauthorized",
}: PermissionGuardProps) => {
  const location = useLocation();

  const user = useAppSelector((state) => state.auth.user);

  // Utilisateur non connecté
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userPermissions = user.permissions ?? [];

  // Vérification des permissions
  const hasAccess = requireAll
    ? permissions.every((permission) => userPermissions.includes(permission))
    : permissions.some((permission) => userPermissions.includes(permission));

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PermissionGuard;
