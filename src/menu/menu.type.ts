export interface MenuItemType {
  id: string;
  title: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItemType[];
  roles?: string[];
  permissions?: string[];
  userTypes?: string[];
}