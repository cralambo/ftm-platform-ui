import { usePermission } from "@/hooks/usePermission";

interface CanProps {
  permissions: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const Can = ({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: CanProps) => {
  const { hasAnyPermission, hasAllPermissions } = usePermission();

  const allowed = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return allowed ? <>{children}</> : <>{fallback}</>;
};

export default Can;
