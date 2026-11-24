export interface MenuItemType {
  id: string;
  title: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItemType[];

  roles?: string[];
  requireAllPermissions?: boolean;
  permissions?: string[];
  userTypes?: string[];
}
