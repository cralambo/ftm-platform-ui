import { usePermission } from "@/hooks/usePermission";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface RequirePermissionProps {
  permissions: string[];
  requireAll?: boolean;
}

const RequirePermission = ({
  permissions,
  requireAll = false,
}: RequirePermissionProps) => {
  const location = useLocation();

  const { hasAnyPermission, hasAllPermissions } = usePermission();

  const allowed = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!allowed) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequirePermission;
